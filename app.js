// INICIO: CONFIGURACIÓN EmailJS
// Rellena con tus datos reales de EmailJS:
const EMAILJS_SERVICE_ID = 'service_lvyywqd';
const EMAILJS_TEMPLATE_ID = 'template_2ppjeoo';
const EMAILJS_PUBLIC_KEY = 'jPuXWXqKXZfqr_HmU';
// El email de destino se configura en la plantilla de EmailJS

// Inicializa EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// ---- Datos demo iniciales ----
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

// ---- Gestión de usuario ----

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
function renderUserInfo() {
    const el = document.getElementById("user-info");
    if (currentUser) {
        el.innerHTML = `
            <span>Bienvenido, <b>${currentUser.name}</b> (${currentUser.type === "expert" ? "Experto" : "Usuario"})</span>
            <button class="logout-btn" id="logout-btn">Cerrar sesión</button>
        `;
        document.getElementById("logout-btn").onclick = function() {
            clearUser();
            updateUI();
        };
    } else {
        el.innerHTML = `<span>No has iniciado sesión.</span>`;
    }
}

// ---- Estrellas y gemas ----

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

// ---- Mostrar items ----

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

// ---- Filtros ----

document.getElementById('category-filter').onchange = function() {
    categoryFilter = this.value;
    renderItems();
};
document.getElementById('order-filter').onchange = function() {
    orderFilter = this.value;
    renderItems();
};

// ---- Modales y botones superiores ----

function showModal(id) {
    document.getElementById(id).classList.remove('hidden');
}
function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

// -- Botón "Registrarse" abre modal para elegir tipo --
document.getElementById('btn-register').onclick = function() {
    showModal('choose-register-modal');
};
// -- Cerrar modal de elección --
document.getElementById('close-choose-register').onclick = function() {
    closeModal('choose-register-modal');
};
// -- Selección de tipo de registro --
document.querySelector('#choose-user .register-type-btn').onclick = function() {
    closeModal('choose-register-modal');
    showModal('register-modal');
};
document.querySelector('#choose-expert .register-type-btn').onclick = function() {
    closeModal('choose-register-modal');
    showModal('register-expert-modal');
};
// -- Cerrar modales registro usuario/experto --
document.getElementById('close-register').onclick = function() {
    closeModal('register-modal');
};
document.getElementById('close-register-expert').onclick = function() {
    closeModal('register-expert-modal');
};
// -- Botón "Califica" --
document.getElementById('btn-califica').onclick = function() {
    if (!currentUser) {
        alert('Debes estar registrado para agregar un ítem.');
        showModal('choose-register-modal');
        return;
    }
    showModal('add-item-modal');
};
// -- Cerrar modal agregar ítem --
document.getElementById('close-add-item').onclick = function() {
    closeModal('add-item-modal');
};

// ---- Agregar ítem ----

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
    closeModal('add-item-modal');
    renderItems();
});

// ---- Calificar ítem ----

let currentRateIdx = null;
function openRateForm(idx) {
    if (!currentUser) {
        alert("Debes registrarte o iniciar sesión para calificar.");
        showModal('choose-register-modal');
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
        showModal('choose-register-modal');
        return;
    }
    const rating = parseInt(document.getElementById('star-rating').value);
    const word = document.getElementById('single-word').value.trim();
    if (!rating || !word) return;
    const target = items[currentRateIdx];
    target.rankings[currentUser.type || "user"].push(rating);
    target.opinions[currentUser.type || "user"].push({word, name: currentUser.name});
    document.getElementById('rate-item-section').classList.add('hidden');
    this.reset();
    renderItems();
    currentRateIdx = null;
});

// ---- Registro de usuario común ----

document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const age = parseInt(document.getElementById('reg-age').value);
    const email = document.getElementById('reg-email').value.trim();

    if (!name || !age || !email) return;

    currentUser = { name, age, email, type: "user" };
    saveUser(currentUser);
    this.reset();
    closeModal('register-modal');
    updateUI();
});

// ---- Registro de solicitud de experto ----

document.getElementById('register-expert-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Recolectar datos
    const name = document.getElementById('exp-name').value.trim();
    const age = parseInt(document.getElementById('exp-age').value);
    const email = document.getElementById('exp-email').value.trim();
    const area = document.getElementById('exp-area').value.trim();
    const exp = document.getElementById('exp-experience').value.trim();
    const link1 = document.getElementById('exp-link1').value.trim();
    const link2 = document.getElementById('exp-link2').value.trim();
    const filesInput = document.getElementById('exp-file');
    let files = [];
    if (filesInput && filesInput.files && filesInput.files.length > 0) {
        for (let i = 0; i < filesInput.files.length; i++) {
            files.push(filesInput.files[i].name);
        }
    }
    // Guardar solicitud en localStorage
    const req = { 
        name, age, email, area, exp, 
        links: [link1, link2].filter(Boolean), 
        files, 
        date: new Date().toISOString(), 
        status: "pendiente"
    };
    let prev = [];
    try { prev = JSON.parse(localStorage.getItem('citlalin_expert_requests')) || []; } catch {}
    prev.push(req);
    localStorage.setItem('citlalin_expert_requests', JSON.stringify(prev));
    // Enviar por Email
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        name: name,
        age: age,
        email: email,
        area: area,
        experience: exp,
        link1: link1,
        link2: link2,
        files: files.join(', ')
    }).then(() => {
        document.getElementById('exp-success-message').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('exp-success-message').classList.add('hidden');
            closeModal('register-expert-modal');
            document.getElementById('register-expert-form').reset();
        }, 3000);
    }, (error) => {
        alert('Error enviando email: ' + error.text);
    });
});

// ---- Panel de Administración ----

const ADMIN_PANEL_KEY = "citlalin_admin";
const ADMIN_PASSWORD = "citlalin2024"; // Cambia esta clave por la que prefieras

// Mostrar botón admin sólo si eres admin
function updateAdminButton() {
    const btn = document.getElementById('btn-admin-panel');
    if (localStorage.getItem(ADMIN_PANEL_KEY) === "yes") {
        btn.classList.remove('hidden');
    } else {
        btn.classList.add('hidden');
    }
}
// Mostrar panel admin
document.getElementById('btn-admin-panel').onclick = function() {
    renderAdminPanel();
    showModal('admin-panel-modal');
};
// Cerrar panel admin
document.getElementById('close-admin-panel').onclick = function() {
    closeModal('admin-panel-modal');
};
document.getElementById('admin-logout').onclick = function() {
    closeModal('admin-panel-modal');
};
// Acceso admin por doble click en logo Citlalin
document.querySelector('header h1').ondblclick = function() {
    if (localStorage.getItem(ADMIN_PANEL_KEY) === "yes") {
        renderAdminPanel();
        showModal('admin-panel-modal');
        return;
    }
    const pass = prompt("Clave admin:");
    if (pass && pass === ADMIN_PASSWORD) {
        localStorage.setItem(ADMIN_PANEL_KEY, "yes");
        updateAdminButton();
        renderAdminPanel();
        showModal('admin-panel-modal');
    } else if (pass) {
        alert("Clave incorrecta.");
    }
};
// Renderizar solicitudes en panel admin
function renderAdminPanel() {
    let reqs = [];
    try { reqs = JSON.parse(localStorage.getItem('citlalin_expert_requests')) || []; } catch {}
    const list = document.getElementById('admin-expert-list');
    if (reqs.length === 0) {
        list.innerHTML = "<p style='color:#fff;text-align:center;'>No hay solicitudes pendientes.</p>";
        return;
    }
    list.innerHTML = "";
    reqs.forEach((r, idx) => {
        list.innerHTML += `
        <div class="admin-card">
            <div><b>Nombre:</b> ${r.name}</div>
            <div><b>Email:</b> ${r.email}</div>
            <div><b>Edad:</b> ${r.age}</div>
            <div><b>Área:</b> ${r.area}</div>
            <div><b>Experiencia:</b> ${r.exp}</div>
            <div><b>Enlaces:</b> ${r.links && r.links.length > 0 ? r.links.map(l => `<a href="${l}" target="_blank">${l}</a>`).join(" | ") : "N/A"}</div>
            <div><b>Archivos:</b> ${r.files && r.files.length > 0 ? r.files.join(", ") : "N/A"}</div>
            <div><b>Fecha:</b> ${new Date(r.date).toLocaleString()}</div>
            <div class="expert-status">Estado: ${r.status || "pendiente"}</div>
            <div class="expert-btns">
                <button onclick="approveExpert(${idx})">Aprobar</button>
                <button onclick="rejectExpert(${idx})">Rechazar</button>
            </div>
        </div>
        `;
    });
}
window.approveExpert = function(idx) {
    let reqs = [];
    try { reqs = JSON.parse(localStorage.getItem('citlalin_expert_requests')) || []; } catch {}
    if (!reqs[idx]) return;
    reqs[idx].status = "aprobado";
    localStorage.setItem('citlalin_expert_requests', JSON.stringify(reqs));
    alert("¡Experto aprobado! Ahora puedes darle acceso manualmente cambiando el tipo de usuario en la base de datos/localStorage.");
    renderAdminPanel();
};
window.rejectExpert = function(idx) {
    let reqs = [];
    try { reqs = JSON.parse(localStorage.getItem('citlalin_expert_requests')) || []; } catch {}
    if (!reqs[idx]) return;
    reqs[idx].status = "rechazado";
    localStorage.setItem('citlalin_expert_requests', JSON.stringify(reqs));
    renderAdminPanel();
};

// ---- Inicializar y flujo ----

function updateUI() {
    renderUserInfo();
    renderItems();
    updateAdminButton();
}
window.onload = function() {
    loadUser();
    updateUI();
    updateAdminButton();
};
