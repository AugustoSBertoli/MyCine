const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// ── CARREGA DADOS DO USUÁRIO ──
function carregarPerfil() {
    const usuario = JSON.parse(localStorage.getItem('mycine_usuario') || '{}');

    // nome e avatar
    document.getElementById('perfil-nome').textContent = usuario.usuario || 'Usuário';
    document.getElementById('avatar-grande').textContent = usuario.avatar || '🎬';

    // stats
    const assistidos = JSON.parse(localStorage.getItem('mycine_assistidos') || '[]');
    const favoritos  = JSON.parse(localStorage.getItem('mycine_favoritos') || '[]');
    const listas     = JSON.parse(localStorage.getItem('mycine_listas') || '[]');

    document.getElementById('stat-assistidos').textContent = assistidos.length;
    document.getElementById('stat-favoritos').textContent  = favoritos.length;
    document.getElementById('stat-listas').textContent     = listas.length;

    // renderiza cada aba
    renderFilmes('grid-assistidos', 'vazio-assistidos', assistidos);
    renderFilmes('grid-favoritos',  'vazio-favoritos',  favoritos);
    renderListas(listas);
}

// ── RENDERIZA GRID DE FILMES ──
function renderFilmes(gridId, vazioId, filmes) {
    const grid  = document.getElementById(gridId);
    const vazio = document.getElementById(vazioId);

    grid.innerHTML = '';

    if (filmes.length === 0) {
        vazio.style.display = 'block';
        return;
    }

    vazio.style.display = 'none';

    filmes.forEach(filme => {
        const ano  = filme.release_date ? filme.release_date.slice(0, 4) : '—';
        const nota = filme.vote_average ? filme.vote_average.toFixed(1) : '—';

        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            ${filme.poster_path
                ? `<img src="${IMG_URL}${filme.poster_path}" alt="${filme.title}" loading="lazy"/>`
                : `<div class="no-img">🎬</div>`
            }
            <button class="remover-btn" data-id="${filme.id}" data-grid="${gridId}">✕</button>
            <div class="card-info">
                <div class="card-title">${filme.title}</div>
                <div class="card-meta">
                    <span>${ano}</span>
                    <span class="card-rating">★ ${nota}</span>
                </div>
            </div>
        `;

        // abre detalhes ao clicar no card
        card.addEventListener('click', e => {
            if (!e.target.closest('.remover-btn')) {
                window.location.href = `../Detalhes/detalhes.html?id=${filme.id}`;
            }
        });

        // remove o filme da lista
        card.querySelector('.remover-btn').addEventListener('click', e => {
            e.stopPropagation();
            removerFilme(filme.id, gridId);
        });

        grid.appendChild(card);
    });
}

// ── REMOVE FILME ──
function removerFilme(id, gridId) {
    const chave = gridId === 'grid-assistidos' ? 'mycine_assistidos' : 'mycine_favoritos';
    let filmes = JSON.parse(localStorage.getItem(chave) || '[]');
    filmes = filmes.filter(f => f.id !== id);
    localStorage.setItem(chave, JSON.stringify(filmes));
    carregarPerfil();
}

// ── RENDERIZA LISTAS ──
function renderListas(listas) {
    const grid  = document.getElementById('grid-listas');
    const vazio = document.getElementById('vazio-listas');

    grid.innerHTML = '';

    if (listas.length === 0) {
        vazio.style.display = 'block';
        return;
    }

    vazio.style.display = 'none';

    const icones = ['🎬', '⭐', '🍿', '🎭', '🎥', '🌟', '❤️', '🔥'];

    listas.forEach((lista, idx) => {
        const card = document.createElement('div');
        card.className = 'lista-card';
        card.innerHTML = `
            <div class="lista-icone">${icones[idx % icones.length]}</div>
            <div class="lista-nome">${lista.nome}</div>
            <div class="lista-qtd">${lista.filmes?.length || 0} filmes</div>
            <div class="lista-acoes">
                <button onclick="abrirLista(${idx})">Ver lista</button>
                <button onclick="excluirLista(${idx})">Excluir</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ── NOVA LISTA ──
document.getElementById('btn-nova-lista').addEventListener('click', () => {
    const nome = prompt('Nome da nova lista:');
    if (!nome || !nome.trim()) return;

    const listas = JSON.parse(localStorage.getItem('mycine_listas') || '[]');
    listas.push({ nome: nome.trim(), filmes: [] });
    localStorage.setItem('mycine_listas', JSON.stringify(listas));
    carregarPerfil();
});

// ── ABRE LISTA ──
function abrirLista(idx) {
    window.location.href = `../Lista/lista.html?idx=${idx}`;
}

// ── EXCLUI LISTA ──
function excluirLista(idx) {
    if (!confirm('Excluir esta lista?')) return;
    const listas = JSON.parse(localStorage.getItem('mycine_listas') || '[]');
    listas.splice(idx, 1);
    localStorage.setItem('mycine_listas', JSON.stringify(listas));
    carregarPerfil();
}

// ── ABAS ──
document.querySelectorAll('.aba').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.aba').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.aba-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`panel-${btn.dataset.aba}`).classList.add('active');
    });
});

// ── SAIR ──
document.getElementById('btn-sair').addEventListener('click', () => {
    localStorage.removeItem('mycine_logado');
    window.location.href = '../Cadastro/login.html';
});


// abre aba correta baseado no hash da URL
function verificarHash() {
    const hash = window.location.hash;
    if (hash === '#listas' || hash === '#favoritos' || hash === '#assistidos') {
        const aba = hash.replace('#', '');
        document.querySelectorAll('.aba').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.aba-panel').forEach(p => p.classList.remove('active'));
        document.querySelector(`.aba[data-aba="${aba}"]`).classList.add('active');
        document.getElementById(`panel-${aba}`).classList.add('active');
    }
}

// ── START ──
carregarPerfil();
verificarHash();