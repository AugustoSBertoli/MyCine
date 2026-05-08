// ATENÇÃO: armazenamento local apenas para fins de demonstração.

// ── CADASTRO ──
const formCadastro = document.querySelector('.container-cadastro form');

formCadastro.addEventListener('submit', function(e) {
    e.preventDefault();

    const usuario = document.getElementById('cad-usuario').value.trim();
    const email = document.getElementById('cad-email').value.trim();
    const senha = document.getElementById('cad-senha').value.trim();
    const avatar = document.querySelector('.avatar.sel')?.textContent || '🎬';

    if (!usuario || !email || !senha) {
        alert('Preencha todos os campos!');
        return;
    }

    const dados = { usuario, email, senha, avatar };
    localStorage.setItem('mycine_usuario', JSON.stringify(dados));

    alert('Conta criada com sucesso!');
    window.location.href = '../Home/home.html';
});

// ── LOGIN ──
const formLogin = document.querySelector('.container-login form');

formLogin.addEventListener('submit', function(e) {
    e.preventDefault();

    const usuario = document.getElementById('login-usuario').value.trim();
    const senha = document.getElementById('login-senha').value.trim();

    if (!usuario || !senha) {
        alert('Preencha todos os campos!');
        return;
    }

    const dados = JSON.parse(localStorage.getItem('mycine_usuario'));

    if (!dados) {
        alert('Nenhuma conta encontrada. Cadastre-se primeiro!');
        return;
    }

    if (dados.usuario === usuario && dados.senha === senha) {
        localStorage.setItem('mycine_logado', 'true');
        window.location.href = '../Home/home.html';
    } else {
        alert('Usuário ou senha incorretos!');
    }
});

// ── AVATAR ──
document.querySelectorAll('.avatar').forEach(av => {
    av.addEventListener('click', function() {
        document.querySelectorAll('.avatar').forEach(a => a.classList.remove('sel'));
        this.classList.add('sel');
    });
});