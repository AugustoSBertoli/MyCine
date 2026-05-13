const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// pega o índice da lista que veio na URL
// ex: lista.html?idx=0
const params = new URLSearchParams(window.location.search);
const idx = parseInt(params.get('idx'));

// se não tiver índice válido, volta pro perfil
if (isNaN(idx)) window.location.href = '../Perfil/perfil.html';

const icones = ['🎬', '⭐', '🍿', '🎭', '🎥', '🌟', '❤️', '🔥'];

// ── CARREGA LISTA ──
function carregarLista() {
    const listas = JSON.parse(localStorage.getItem('mycine_listas') || '[]');

    // se a lista não existir mais, volta pro perfil
    if (!listas[idx]) {
        window.location.href = '../Perfil/perfil.html';
        return;
    }

    const lista = listas[idx];

    document.getElementById('lista-icone').textContent = icones[idx % icones.length];
    document.getElementById('lista-nome').textContent  = lista.nome;
    document.title = `MyCine - ${lista.nome}`;

    const filmes = lista.filmes || [];
    document.getElementById('lista-qtd').textContent =
        `${filmes.length} ${filmes.length === 1 ? 'filme' : 'filmes'}`;

    const grid  = document.getElementById('movie-grid');
    const vazio = document.getElementById('vazio');
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
            <button class="remover-btn" title="Remover da lista">✕</button>
            <div class="card-info">
                <div class="card-title">${filme.title}</div>
                <div class="card-meta">
                    <span>${ano}</span>
                    <span class="card-rating">★ ${nota}</span>
                </div>
            </div>
        `;

        // abre detalhes
        card.addEventListener('click', e => {
            if (!e.target.closest('.remover-btn')) {
                window.location.href = `../Detalhes/detalhes.html?id=${filme.id}`;
            }
        });

        // remove da lista
        card.querySelector('.remover-btn').addEventListener('click', e => {
            e.stopPropagation();
            removerDaLista(filme.id);
        });

        grid.appendChild(card);
    });
}

// ── REMOVE FILME DA LISTA ──
function removerDaLista(filmeId) {
    const listas = JSON.parse(localStorage.getItem('mycine_listas') || '[]');
    listas[idx].filmes = listas[idx].filmes.filter(f => f.id !== filmeId);
    localStorage.setItem('mycine_listas', JSON.stringify(listas));
    carregarLista();
}

// ── RENOMEAR ──
document.getElementById('btn-renomear').addEventListener('click', () => {
    const listas = JSON.parse(localStorage.getItem('mycine_listas') || '[]');
    const novoNome = prompt('Novo nome da lista:', listas[idx].nome);
    if (!novoNome || !novoNome.trim()) return;
    listas[idx].nome = novoNome.trim();
    localStorage.setItem('mycine_listas', JSON.stringify(listas));
    carregarLista();
});

// ── EXCLUIR LISTA ──
document.getElementById('btn-excluir').addEventListener('click', () => {
    if (!confirm('Excluir esta lista permanentemente?')) return;
    const listas = JSON.parse(localStorage.getItem('mycine_listas') || '[]');
    listas.splice(idx, 1);
    localStorage.setItem('mycine_listas', JSON.stringify(listas));
    window.location.href = '../Perfil/perfil.html';
});

// ── START ──
carregarLista();