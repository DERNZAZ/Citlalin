// Datos demo iniciales
let items = [
    {
        title: "The Legend of Zelda: Breath of the Wild",
        category: "Videojuegos",
        description: "Aventura épica de mundo abierto.",
        rankings: { user: [7, 6, 7], expert: [7, 7] },
        opinions: { user: ["Épico", "Innovador", "Asombroso"], expert: ["Referente", "Obra"] }
    },
    {
        title: "Ciudad de México",
        category: "Lugares",
        description: "Capital de México, llena de historia y cultura.",
        rankings: { user: [6, 5], expert: [6] },
        opinions: { user: ["Vibrante", "Completa"], expert: ["Diversa"] }
    },
    {
        title: "Elon Musk",
        category: "Personas Públicas",
        description: "Emprendedor, CEO de varias compañías tecnológicas.",
        rankings: { user: [5, 4], expert: [5] },
        opinions: { user: ["Polémico", "Genio"], expert: ["Visionario"] }
    }
];

// Estado para filtro y orden
let categoryFilter = "all";
let orderFilter = "desc";

// Renderizar estrellas (máximo 7)
function renderStars(num) {
    return '★'.repeat(num) + '☆'.repeat(7 - num);
}

// Calcular promedio de estrellas (entero)
function avg(arr) {
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

// Mostrar ítems
function renderItems() {
    let filtered = items.filter(item => categoryFilter === "all" || item.category === categoryFilter);
    // Promedio combinado user + expert para ordenar
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
                ${item.opinions.user.map(op => `<span class="opinion">"${op}"</span>`).join(", ")}
                <br>
                <b>Palabras de expertos:</b>
                ${item.opinions.expert.map(op => `<span class="opinion">"${op}"</span>`).join(", ")}
            </div>
            <button class="rate-btn" data-idx="${idx}">Calificar</button>
        </div>
        `;
    });

    // Asignar eventos a botones de calificar
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

// Agregar nuevo ítem
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

// Calificar ítem
let currentRateIdx = null;
function openRateForm(idx) {
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
    const userType = document.getElementById('user-type').value;
    const rating = parseInt(document.getElementById('star-rating').value);
    const word = document.getElementById('single-word').value.trim();
    if (!userType || !rating || !word) return;
    const target = items[currentRateIdx];
    target.rankings[userType].push(rating);
    target.opinions[userType].push(word);
    document.getElementById('rate-item-section').classList.add('hidden');
    this.reset();
    renderItems();
    currentRateIdx = null;
});

// Inicializar
renderItems();
