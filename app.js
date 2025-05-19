// === Citlalin Ranking vFinal (todo fusionado y actualizado) ===
const ADMIN_PASSWORD = "citlalin2024";

// === Variables de estado ===
let currentUser = null;
let items = [];
let editingOpinion = null; // Para editar opiniones

// === Utilidades ===
function saveItems() {
    localStorage.setItem('citlalin_items', JSON.stringify(items));
}
function loadItems() {
    items = JSON.parse(localStorage.getItem('citlalin_items')) || [];
}
function saveUser(user) {
    localStorage.setItem('citlalin_user', JSON.stringify(user));
}
function loadUser() {
    currentUser = JSON.parse(localStorage.getItem('citlalin_user'));
}
function formatDate(d) {
    const date = new Date(d);
    return date.toLocaleString("es-MX", {
        day: "2-digit", month: "2-digit", year: "2-digit",
        hour: "2-digit", minute: "2-digit"
    });
}
function getUserOpinion(item) {
    if (!currentUser) return null;
    return item.opinions.find(op => op.email === currentUser.email);
}

// === RENDERIZADO PRINCIPAL ===
function renderItems() {
    const category = document.getElementById("category-filter").value;
    const order = document.getElementById("order-filter").value;
    const itemsList = document.getElementById("items-list");
    itemsList.innerHTML = "";

    let filteredItems = items.filter(item =>
        category === "all" || item.category === category
    );

    // Ordenar por promedio de estrellas
    filteredItems.sort((a, b) => {
        const avgA = getItemAvg(a);
        const avgB = getItemAvg(b);
        return order === "desc" ? avgB - avgA : avgA - avgB;
    });

    filteredItems.forEach(item => {
        itemsList.appendChild(createItemCard(item));
    });
}

function getItemAvg(item) {
    if (!item.opinions.length) return 0;
    return item.opinions.reduce((s, o) => s + o.stars, 0) / item.opinions.length;
}

function createItemCard(item) {
    const card = document.createElement("div");
    card.className = "item-card";

    // Título y categoría
    card.innerHTML = `
        <div>
            <span class="ranking-type">${item.category}</span>
            <span style="font-weight:800;font-size:1.1em">${item.title}</span>
        </div>
        <div style="margin:0.2em 0 0.5em 0">
            <span class="stars">${renderStars(getItemAvg(item))}</span>
            <span style="margin-left:1em;font-size:0.93em;">(${item.opinions.length} opiniones)</span>
        </div>
        <div class="item-description">${item.description || ""}</div>
    `;

    // Botón calificar (si usuario logueado)
    if (currentUser) {
        const btn = document.createElement("button");
        btn.className = "rate-btn";
        btn.textContent = getUserOpinion(item) ? "Editar mi opinión" : "Calificar";
        btn.onclick = () => openRateItem(item.title, !!getUserOpinion(item));
        card.appendChild(btn);
    }

    // Bloque de opiniones
    card.appendChild(renderOpinionsBlock(item));

    return card;
}

// RENDER DE OPINIONES
function renderOpinionsBlock(item) {
    const block = document.createElement("div");
    block.className = "opinions-block";

    // Filtros de opiniones
    const filters = document.createElement("div");
    filters.className = "opinions-filters";
    filters.innerHTML = `
        <label>
            <input type="radio" name="opinions-type-${item.title}" value="all" checked> Todas
        </label>
        <label>
            <input type="radio" name="opinions-type-${item.title}" value="expert"> Solo expertos
        </label>
        <label>
            <input type="radio" name="opinions-type-${item.title}" value="user"> Solo usuarios
        </label>
    `;
    block.appendChild(filters);

    const list = document.createElement("div");
    list.className = "opinions-list";
    block.appendChild(list);

    function updateList() {
        let type = block.querySelector('input[name^="opinions-type"]:checked').value;
        let ops = [...item.opinions];

        // Tu propia opinión primero
        if (currentUser) {
            ops.sort((a, b) => {
                if (a.email === currentUser.email) return -1;
                if (b.email === currentUser.email) return 1;
                return 0;
            });
        }
        if (type === "expert") ops = ops.filter(o => o.userType === "experto");
        if (type === "user") ops = ops.filter(o => o.userType !== "experto");

        list.innerHTML = "";
        if (!ops.length) {
            list.innerHTML = `<div style="color:#696E79;font-size:0.98em;margin-top:0.5em;">No hay opiniones aún.</div>`;
            return;
        }
        ops.forEach(op => {
            const opDiv = document.createElement("div");
            opDiv.className = "opinion" + (op.userType === "experto" ? " by-expert" : " by-user");
            if (currentUser && op.email === currentUser.email) { opDiv.classList.add("my-opinion"); }

            opDiv.innerHTML = `
                <span class="opinion-stars">${renderStars(op.stars)}</span>
                <span class="opinion-user">${op.username}${op.userType === "experto" ? " <span class='op-expert-badge'>(Experto)</span>" : ""}</span>
                <span class="opinion-word">Palabra: <b>${op.word}</b></span>
                <span class="opinion-date">${op.date ? formatDate(op.date) : ""}</span>
            `;
            // Botones editar/borrar para tu opinión
            if (currentUser && op.email === currentUser.email) {
                const btns = document.createElement("span");
                btns.className = "opinion-actions";
                const editBtn = document.createElement("button");
                editBtn.textContent = "Editar";
                editBtn.onclick = () => openRateItem(item.title, true);
                const delBtn = document.createElement("button");
                delBtn.textContent = "Borrar";
                delBtn.onclick = () => { deleteOpinion(item.title); };
                btns.appendChild(editBtn);
                btns.appendChild(delBtn);
                opDiv.appendChild(btns);
            }
            list.appendChild(opDiv);
        });
    }
    // Eventos filtro
    filters.querySelectorAll('input').forEach(inp => inp.addEventListener("change", updateList));
    updateList();
    return block;
}

function renderStars(stars) {
    stars = Math.round(stars);
    const names = [
        "star-quartz", "star-amethyst", "star-topaz", "star-ruby", "star-sapphire", "star-emerald", "star-diamond"
    ];
    let html = "";
    for (let i = 1; i <= 7; i++) {
        let cls = i <= stars ? names[i - 1] : "star-empty";
        html += `<span class="${cls}">★</span>`;
    }
    return html;
}

// === CALIFICAR/EDITAR OPINIÓN ===
function openRateItem(title, isEdit = false) {
    const section = document.getElementById("rate-item-section");
    section.classList.remove("hidden");
    document.getElementById("rate-item-title").textContent = title;
    editingOpinion = isEdit;
    // Si es edición, precarga datos
    if (isEdit) {
        let item = items.find(i => i.title === title);
        let op = getUserOpinion(item);
        document.getElementById("star-rating").value = op.stars;
        document.getElementById("single-word").value = op.word;
    } else {
        document.getElementById("star-rating").value = "";
        document.getElementById("single-word").value = "";
    }
    document.getElementById("rate-form").onsubmit = e => {
        e.preventDefault();
        saveOpinion(title);
        section.classList.add("hidden");
    };
}

function saveOpinion(title) {
    let stars = Number(document.getElementById("star-rating").value);
    let word = document.getElementById("single-word").value.trim();
    let item = items.find(i => i.title === title);
    let now = new Date().toISOString();
    let opIndex = item.opinions.findIndex(op => op.email === currentUser.email);

    const newOpinion = {
        username: currentUser.name,
        userType: currentUser.type,
        stars,
        word,
        date: now,
        email: currentUser.email
    };

    if (opIndex !== -1) {
        // Edita
        item.opinions[opIndex] = newOpinion;
    } else {
        // Nueva
        item.opinions.push(newOpinion);
    }
    saveItems();
    renderItems();
}

function deleteOpinion(title) {
    let item = items.find(i => i.title === title);
    item.opinions = item.opinions.filter(op => op.email !== currentUser.email);
    saveItems();
    renderItems();
}

// === INICIALIZAR DATOS DEMO SI NO EXISTEN ===
function ensureDemoData() {
    if (!localStorage.getItem('citlalin_items')) {
        items = [
            {
                title: "The Legend of Zelda",
                category: "Videojuegos",
                description: "Aventura",
                opinions: [
                    {username:"AnaGamer",userType:"experto",stars:7,word:"Innovador",date:"2025-05-19T03:20",email:"ana@citlalin.com"},
                    {username:"LaloFan",userType:"usuario",stars:6,word:"Divertido",date:"2025-05-18T18:10",email:"lalo@gmail.com"}
                ]
            },
            {
                title: "Mario Bros",
                category: "Videojuegos",
                description: "Plataformas",
                opinions: []
            },
            {
                title: "Shigeru Miyamoto",
                category: "Personas Públicas",
                description: "Creador icónico Nintendo",
                opinions: []
            },
            {
                title: "París",
                category: "Lugares",
                description: "Ciudad emblemática europea",
                opinions: []
            },
            {
                title: "Machu Picchu",
                category: "Lugares",
                description: "Maravilla del mundo",
                opinions: []
            },
            {
                title: "Keanu Reeves",
                category: "Personas Públicas",
                description: "Actor carismático",
                opinions: []
            }
        ];
        saveItems();
    }
}

// === REGISTRO Y USUARIO ===
function renderUserInfo() {
    const div = document.getElementById("user-info");
    if (!currentUser) {
        div.innerHTML = "";
        return;
    }
    div.innerHTML = `
        <span>${currentUser.name} (${currentUser.type})</span>
        <button class="logout-btn" onclick="logout()">Salir</button>
    `;
}
window.logout = function() {
    localStorage.removeItem('citlalin_user');
    currentUser = null;
    renderUserInfo();
    renderItems();
};

// === EVENTOS: REGISTRO, CALIFICAR, FILTROS ===
document.addEventListener("DOMContentLoaded", () => {
    ensureDemoData();
    loadItems();
    loadUser();
    renderUserInfo();
    renderItems();

    document.getElementById("category-filter").onchange = renderItems;
    document.getElementById("order-filter").onchange = renderItems;
    document.getElementById("close-rate").onclick = () => {
        document.getElementById("rate-item-section").classList.add("hidden");
    };
    // Demo: registro muy simple
    document.getElementById("btn-register").onclick = () => {
        let name = prompt("¿Tu nombre?");
        if (!name) return;
        let email = prompt("¿Tu email?");
        if (!email) return;
        let type = confirm("¿Eres experto? Acepta para experto, cancela para usuario normal") ? "experto" : "usuario";
        currentUser = {name, email, type};
        saveUser(currentUser);
        renderUserInfo();
        renderItems();
    };
    document.getElementById("btn-califica").onclick = () => {
        alert("Elige el ítem que deseas calificar dando click en el botón 'Calificar' o 'Editar mi opinión' debajo del título del ítem.");
    };
});
