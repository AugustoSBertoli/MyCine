// ── CONFIGURAÇÃO ──
const API_KEY = 'c5e26f7773b6ba17f0fe753127ff7566';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// ── ESTADO ──
let paginaAtual = 1;
let totalPaginas = 1;
let buscaAtual = '';
let generoAtual = null;
let carregando = false;

// ── ELEMENTOS ──
const movieGrid = document.getElementById('movie-grid');
const genreRow = document.getElementById('genre-row');
const resultsTitle = document.getElementById('results-title');
const loader = document.getElementById('loader');
const btnBusca = document.getElementById('btn-busca');
const inputBusca = document.getElementById('busca');

// ── INICIALIZA ──
async function init() {
    await carregarGeneros();
    await carregarFilmes();
    scrollInfinito();
}

// ── GÊNEROS ──
async function carregarGeneros() {
    const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=pt-BR`);
    const data = await res.json();

    data.genres.forEach(g => {
        const btn = document.createElement('button');
        btn.className = 'genre-tag';
        btn.textContent = g.name;
        btn.dataset.id = g.id;
        btn.addEventListener('click', () => selecionarGenero(btn, g.id, g.name));
        genreRow.appendChild(btn);
    });
}

function selecionarGenero(btn, id, nome) {
    const jaSelecionado = btn.classList.contains('active');
    document.querySelectorAll('.genre-tag').forEach(b => b.classList.remove('active'));

    if (jaSelecionado) {
        generoAtual = null;
        resultsTitle.textContent = 'Em Alta Agora';
    } else {
        btn.classList.add('active');
        generoAtual = id;
        resultsTitle.textContent = nome;
    }

    buscaAtual = '';
    inputBusca.value = '';
    paginaAtual = 1;
    totalPaginas = 1;
    movieGrid.innerHTML = '';
    carregarFilmes();
}

// ── CARREGA FILMES ──
async function carregarFilmes() {
    if (carregando || paginaAtual > totalPaginas) return;
    carregando = true;
    loader.classList.add('visible');

    let url;
    if (buscaAtual) {
        url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(buscaAtual)}&page=${paginaAtual}`;
    } else if (generoAtual) {
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=pt-BR&with_genres=${generoAtual}&sort_by=popularity.desc&page=${paginaAtual}`;
    } else {
        url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=${paginaAtual}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    totalPaginas = data.total_pages;
    data.results.forEach(filme => movieGrid.appendChild(criarCard(filme)));

    paginaAtual++;
    carregando = false;
    loader.classList.remove('visible');
}

// ── CRIA CARD ──
function criarCard(filme) {
    const favoritos = JSON.parse(localStorage.getItem('mycine_favoritos') || '[]');
    const isFav = favoritos.some(f => f.id === filme.id);
    const ano = filme.release_date ? filme.release_date.slice(0, 4) : '—';
    const nota = filme.vote_average ? filme.vote_average.toFixed(1) : '—';

    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        ${filme.poster_path
            ? `<img src="${IMG_URL}${filme.poster_path}" alt="${filme.title}" loading="lazy"/>`
            : `<div class="no-img">🎬</div>`
        }
        <button class="fav-btn" data-id="${filme.id}">${isFav ? '❤️' : '🤍'}</button>
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
        if (!e.target.closest('.fav-btn')) {
            window.location.href = `../Detalhes/detalhes.html?id=${filme.id}`;
        }
    });

    // favorito
    card.querySelector('.fav-btn').addEventListener('click', e => {
        e.stopPropagation();
        toggleFavorito(filme, card.querySelector('.fav-btn'));
    });

    return card;
}

// ── FAVORITOS ──
function toggleFavorito(filme, btn) {
    let favoritos = JSON.parse(localStorage.getItem('mycine_favoritos') || '[]');
    const idx = favoritos.findIndex(f => f.id === filme.id);

    if (idx === -1) {
        favoritos.push(filme);
        btn.textContent = '❤️';
    } else {
        favoritos.splice(idx, 1);
        btn.textContent = '🤍';
    }

    localStorage.setItem('mycine_favoritos', JSON.stringify(favoritos));
}

// ── BUSCA ──
btnBusca.addEventListener('click', fazerBusca);
inputBusca.addEventListener('keydown', e => {
    if (e.key === 'Enter') fazerBusca();
});

function fazerBusca() {
    buscaAtual = inputBusca.value.trim();
    if (!buscaAtual) return;

    generoAtual = null;
    paginaAtual = 1;
    totalPaginas = 1;
    movieGrid.innerHTML = '';
    document.querySelectorAll('.genre-tag').forEach(b => b.classList.remove('active'));
    resultsTitle.textContent = `Resultados para "${buscaAtual}"`;
    carregarFilmes();
}

// ── SCROLL INFINITO ──
function scrollInfinito() {
    window.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 300) {
            carregarFilmes();
        }
    });
}

// ── START ──
init();