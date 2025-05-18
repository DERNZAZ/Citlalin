// Datos demo iniciales
let items = [
    {
        title: "The Legend of Zelda: Breath of the Wild",
        category: "Videojuegos",
        description: "Aventura épica de mundo abierto.",
        rankings: { user: [7, 6, 7], expert: [7, 7] },
        opinions: { user: [{word: "Épico", name: "Mario"}, {word: "Innovador", name: "Luisa"}, {word: "Asombroso", name: "Mario"}], expert: [{word: "Referente", name: "Expert Z"}, {word: "Obra", name: "Expert Z"}] }
    },
    {
        title: "Ciudad de México",
        category: "Lugares",
        description: "Capital de México, llena de historia y cultura.",
        rankings: { user: [6, 5], expert: [6] },
        opinions: { user: [{word: "Vibrante", name: "Pepe"}, {word: "Completa", name: "Luisa"}], expert: [{word: "Diversa", name: "Expert A"}] }
    },
    {
        title: "Elon Musk",
        category: "Personas Públicas",
        description: "Emprendedor, CEO de varias compañías tecnológicas.",
        rankings: { user: [5, 4], expert: [5] },
        opinions: { user: [{word: "Polémico", name: "Mario"}, {word: "Genio", name: "Luisa"}], expert: [{word: "Visionario", name: "Expert X"}] }
    }
];

// Estado para filtro y orden
let categoryFilter = "all";
let orderFilter = "desc";

// Usuario actual (se guarda en localStorage)
let currentUser = null;

// ------- GESTIÓN DE USUARIO ---------

function saveUser(user) {
    localStorage.setItem("citlalin_user", JSON.stringify(user));
}

function loadUser() {
    const u = localStorage.getItem("citlalin_user");
    if (u) currentUser = JSON.parse(u);
}

function clearUser() {
    localStorage.removeItem("citlalin_user");
    currentUser = null;
}

// Mostrar usuario en cabecera
function renderUserInfo() {
    const el = document.getElementById("user-info");
    if (currentUser) {
        el.innerHTML = `
            <span>Bienvenido, <b>${currentUser.name}</b> (${currentUser.type === "expert" ? "Experto" : "Usuario"})</span>
            <button class="logout-btn" id="logout-btn">Cerrar sesión</button>
        `;
        document.getElementById("logout-btn").onclick = function() {
            clearUser();
            showRegisterSection();
        };
    } else {
        el.innerHTML = `<span>No has iniciado sesión.</span>`;
    }
}

// Mostrar formulario de registro
function showRegisterSection() {
    document.getElementById("register-section").classList.remove("hidden");
    document.getElementById("controls").classList.add("hidden");
    document.getElementById("add-item").classList.add("hidden");
    document.getElementById("items-list").classList.add("hidden");
    document.getElementById("rate-item-section").classList.add("hidden");
    renderUserInfo();
}

// Ocultar registro y mostrar contenido
function showMainContent() {
    document.getElementById("register-section").classList.add("hidden");
    document.getElementById("controls").classList.remove("hidden");
    document.getElementById("add-item").classList.remove("hidden");
    document.getElementById("items-list").classList.remove("hidden");
    renderUserInfo();
    renderItems();
}

// ------- ESTRELLAS Y GEMAS ---------

function getStarClass(num) {
    switch(num) {
        case 1: return "star-quartz";
        case 2: return "star-amethyst";
        case 3: return "star-topaz";
        case 4: return "star-ruby";
        case 5: return "star-sapphire";
        case 6: return "star-emerald";
        case 7: return "star-diamond";
        default: return "star-empty";
    }
}

function getGemName(num) {
    switch(num) {
        case 1: return "Cuarzo";
        case 2: return "Amatista";
        case 3: return "Topacio";
        case 4: return "Rubí";
        case 5: return "Zafiro";
        case 6: return "Esmeralda";
        case 7: return "Diamante";
        default: return "";
    }
}

function renderStars(num) {
    let html = "";
    for(let i=1; i<=7; i++) {
        if(i <= num) {
            html += `<span class="${getStarClass(i)}" title="${getGemName(i)}">${"★"}</span>`;
        } else {
            html += `<span class="star-empty">☆</span>`;
        }
    }
    return html;
}

function avg(arr) {
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

// ------- MOSTRAR ITEMS ---------

function renderItems() {
    let filtered = items.filter(item => categoryFilter === "all" || item.category === categoryFilter);
    filtered = filtered.map(item => ({
        ...item,
        combinedAvg: avg(item.rankings.user.concat(item.rankings.expert))
    }));
    filtered.sort((a, b) => orderFilter === "desc" ? b.combinedAvg - a.combinedAvg : a.combinedAvg - b.combinedAvg);

    const list = document.getElementById('items-list');
    list.innerHTML = '';
    filtered.forEach((item, idx) => {
        const userAvg = avg(item.rankings.user);
        const expertAvg = avg(item.rankings.expert);
        list.innerHTML += `
        <div class="item-card">
            <h2>${item.title}</h2>
            <small>${item.category}</small>
            <p>${item.description}</p>
            <div>
                <span class="ranking-type">Usuarios:</span>
                <span class="stars">${renderStars(userAvg)}</span>
                (${item.rankings.user.length} opiniones)
            </div>
            <div>
                <span class="ranking-type">Expertos:</span>
                <span class="stars">${renderStars(expertAvg)}</span>
                (${item.rankings.expert.length} opiniones)
            </div>
            <div class="rank-opinions">
                <b>Palabras de usuarios:</b>
                ${item.opinions.user.map(op => `<span class="opinion by-user" title="Por: ${op.name}">${op.word}</span>`).join(" ")}
                <br>
                <b>Palabras de expertos:</b>
                ${item.opinions.expert.map(op => `<span class="opinion by-expert" title="Por: ${op.name}">${op.word}</span>`).join(" ")}
            </div>
            <button class="rate-btn" data-idx="${idx}">Calificar</button>
        </div>
        `;
    });

    document.querySelectorAll('.rate-btn').forEach(btn => {
        btn.onclick = () => openRateForm(btn.getAttribute('data-idx'));
    });
}

// Filtros
document.getElementById('category-filter').onchange = function() {
    categoryFilter = this.value;
    renderItems();
};
document.getElementById('order-filter').onchange = function() {
    orderFilter = this.value;
    renderItems();
};

// ------- AGREGAR ITEM ---------

document.getElementById('item-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('item-title').value.trim();
    const category = document.getElementById('item-category').value.trim();
    const description = document.getElementById('item-description').value.trim();
    if (!title || !category || !description) return;
    items.push({
        title,
        category,
        description,
        rankings: { user: [], expert: [] },
        opinions: { user: [], expert: [] }
    });
    this.reset();
    renderItems();
});

// ------- CALIFICAR ITEM ---------

let currentRateIdx = null;
function openRateForm(idx) {
    if (!currentUser) {
        alert("Debes registrarte o iniciar sesión para calificar.");
        showRegisterSection();
        return;
    }
    currentRateIdx = idx;
    document.getElementById('rate-item-title').textContent = items[idx].title;
    document.getElementById('rate-item-section').classList.remove('hidden');
}
document.getElementById('close-rate').onclick = function() {
    document.getElementById('rate-item-section').classList.add('hidden');
    document.getElementById('rate-form').reset();
    currentRateIdx = null;
};
document.getElementById('rate-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentUser) {
        alert("Debes registrarte o iniciar sesión para calificar.");
        showRegisterSection();
        return;
    }
    const rating = parseInt(document.getElementById('star-rating').value);
    const word = document.getElementById('single-word').value.trim();
    if (!rating || !word) return;
    const target = items[currentRateIdx];
    target.rankings[currentUser.type].push(rating);
    target.opinions[currentUser.type].push({word, name: currentUser.name});
    document.getElementById('rate-item-section').classList.add('hidden');
    this.reset();
    renderItems();
    currentRateIdx = null;
});

// ------- REGISTRO DE USUARIO ---------

document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const age = parseInt(document.getElementById('reg-age').value);
    const email = document.getElementById('reg-email').value.trim();
    const type = document.getElementById('reg-type').value;

    if (!name || !age || !email || !type) return;

    currentUser = { name, age, email, type };
    saveUser(currentUser);
    this.reset();
    showMainContent();
});

// ------- INICIALIZAR ---------

window.onload = function() {
    loadUser();
    if (currentUser) {
        showMainContent();
    } else {
        showRegisterSection();
    }
};
