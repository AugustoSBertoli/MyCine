const API_KEY = 'c5e26f7773b6ba17f0fe753127ff7566';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const IMG_ORIG = 'https://image.tmdb.org/t/p/original';

const params = new URLSearchParams(window.location.search);
const filmeId = params.get('id');

if (!filmeId) window.location.href = '../Home/home.html';

async function init() {
    const [detalhes, credits, providers, similares] = await Promise.all([
        fetch(`${BASE_URL}/movie/${filmeId}?api_key=${API_KEY}&language=pt-BR`).then(r => r.json()),
        fetch(`${BASE_URL}/movie/${filmeId}/credits?api_key=${API_KEY}&language=pt-BR`).then(r => r.json()),
        fetch(`${BASE_URL}/movie/${filmeId}/watch/providers?api_key=${API_KEY}`).then(r => r.json()),
        fetch(`${BASE_URL}/movie/${filmeId}/similar?api_key=${API_KEY}&language=pt-BR`).then(r => r.json()),
    ]);

    renderDetalhes(detalhes);
    renderElenco(credits.cast);
    renderProviders(providers.results?.BR);
    renderSimilares(similares.results);
}

// ── DETALHES ──
function renderDetalhes(d) {
    if (d.backdrop_path) {
        document.getElementById('backdrop').style.backgroundImage =
            `url(${IMG_ORIG}${d.backdrop_path})`;
    }

    const poster = document.getElementById('poster');
    if (d.poster_path) {
        poster.src = IMG_URL + d.poster_path;
        poster.alt = d.title;
    } else {
        poster.parentElement.innerHTML = '<div style="aspect-ratio:2/3;background:#2a1a0a;display:flex;align-items:center;justify-content:center;font-size:4rem;border-radius:4px">🎬</div>';
    }

    document.getElementById('titulo').textContent = d.title;
    const tagline = document.getElementById('tagline');
    tagline.textContent = d.tagline ? `"${d.tagline}"` : '';

    const ano = d.release_date ? d.release_date.slice(0, 4) : '—';
    const duracao = d.runtime ? `${d.runtime} min` : '—';
    const nota = d.vote_average ? d.vote_average.toFixed(1) : '—';
    document.getElementById('chips').innerHTML = `
        <span class="chip rating">★ ${nota}</span>
        <span class="chip">${ano}</span>
        <span class="chip">${duracao}</span>
    `;

    document.getElementById('generos').innerHTML =
        d.genres?.map(g => `<span class="genero-tag">${g.name}</span>`).join('') || '';

    document.getElementById('overview').textContent =
        d.overview || 'Sinopse não disponível.';

    document.title = `MyCine - ${d.title}`;

    renderBotoes(d);
}

// ── BOTÕES ──
function renderBotoes(d) {
    const btnFav = document.getElementById('btn-fav');
    const btnAssistido = document.getElementById('btn-assistido');

    const favoritos = JSON.parse(localStorage.getItem('mycine_favoritos') || '[]');
    const assistidos = JSON.parse(localStorage.getItem('mycine_assistidos') || '[]');

    if (favoritos.some(f => f.id === d.id)) {
        btnFav.textContent = '❤️ Favoritado';
        btnFav.classList.add('ativo');
    }
    if (assistidos.some(a => a.id === d.id)) {
        btnAssistido.textContent = '✅ Assistido';
        btnAssistido.classList.add('ativo');
    }

    btnFav.addEventListener('click', () => {
        let favs = JSON.parse(localStorage.getItem('mycine_favoritos') || '[]');
        const idx = favs.findIndex(f => f.id === d.id);
        if (idx === -1) {
            favs.push(d);
            btnFav.textContent = '❤️ Favoritado';
            btnFav.classList.add('ativo');
        } else {
            favs.splice(idx, 1);
            btnFav.textContent = '🤍 Favoritar';
            btnFav.classList.remove('ativo');
        }
        localStorage.setItem('mycine_favoritos', JSON.stringify(favs));
    });

    btnAssistido.addEventListener('click', () => {
        let assts = JSON.parse(localStorage.getItem('mycine_assistidos') || '[]');
        const idx = assts.findIndex(a => a.id === d.id);
        if (idx === -1) {
            assts.push(d);
            btnAssistido.textContent = '✅ Assistido';
            btnAssistido.classList.add('ativo');
        } else {
            assts.splice(idx, 1);
            btnAssistido.textContent = '✅ Marcar como assistido';
            btnAssistido.classList.remove('ativo');
        }
        localStorage.setItem('mycine_assistidos', JSON.stringify(assts));
    });

    document.getElementById('btn-lista').addEventListener('click', () => {
        const listas = JSON.parse(localStorage.getItem('mycine_listas') || '[]');
        if (listas.length === 0) {
            alert('Você não tem listas criadas. Crie uma no Perfil!');
            return;
        }
        const nomes = listas.map((l, i) => `${i + 1}. ${l.nome}`).join('\n');
        const escolha = prompt(`Escolha uma lista:\n${nomes}`);
        const idx = parseInt(escolha) - 1;
        if (isNaN(idx) || idx < 0 || idx >= listas.length) return;
        if (!listas[idx].filmes) listas[idx].filmes = [];
        if (!listas[idx].filmes.some(f => f.id === d.id)) {
            listas[idx].filmes.push(d);
            localStorage.setItem('mycine_listas', JSON.stringify(listas));
            alert(`Adicionado à lista "${listas[idx].nome}"!`);
        } else {
            alert('Filme já está nessa lista!');
        }
    });
}

// ── ONDE ASSISTIR ──
function renderProviders(br) {
    const container = document.getElementById('providers');

    const streaming = br?.flatrate || [];
    const aluguel = br?.rent || [];
    const compra = br?.buy || [];
    const link = br?.link || '#';

    if (streaming.length === 0 && aluguel.length === 0 && compra.length === 0) {
        container.innerHTML = '<p class="sem-provider">Não disponível no Brasil no momento.</p>';
        return;
    }

    let html = '';

    if (streaming.length > 0) {
        html += '<div class="provider-grupo"><p class="provider-label">Streaming</p><div class="provider-row">';
        streaming.forEach(p => {
            html += `
                <a class="provider" href="${link}" target="_blank" title="${p.provider_name}">
                    <img src="https://image.tmdb.org/t/p/w45${p.logo_path}" alt="${p.provider_name}"/>
                    <span>${p.provider_name}</span>
                </a>`;
        });
        html += '</div></div>';
    }

    if (aluguel.length > 0) {
        html += '<div class="provider-grupo"><p class="provider-label">Aluguel</p><div class="provider-row">';
        aluguel.forEach(p => {
            html += `
                <a class="provider" href="${link}" target="_blank" title="${p.provider_name}">
                    <img src="https://image.tmdb.org/t/p/w45${p.logo_path}" alt="${p.provider_name}"/>
                    <span>${p.provider_name}</span>
                </a>`;
        });
        html += '</div></div>';
    }

    container.innerHTML = html;
}

// ── ELENCO ──
function renderElenco(cast) {

    const container = document.getElementById('elenco');
    container.innerHTML = cast.slice(0, 10).map(ator => `
        <div class="ator-card">
            ${ator.profile_path
                ? `<img src="${IMG_URL}${ator.profile_path}" alt="${ator.name}"/>`
                : `<div class="no-foto">🎭</div>`
            }
            <div class="ator-nome">${ator.name}</div>
            <div class="ator-personagem">${ator.character}</div>
        </div>
    `).join('');
}

// ── SIMILARES ──
function renderSimilares(filmes) {
    const container = document.getElementById('similares');
    container.innerHTML = filmes.slice(0, 8).map(f => `
        <div class="similar-card" onclick="window.location.href='detalhes.html?id=${f.id}'">
            ${f.poster_path
                ? `<img src="${IMG_URL}${f.poster_path}" alt="${f.title}" loading="lazy"/>`
                : `<div class="no-img">🎬</div>`
            }
            <div class="similar-titulo">${f.title}</div>
        </div>
    `).join('');
}

// ── START ──
init();