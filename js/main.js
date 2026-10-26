document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. ЛОГИКА ДЛЯ СТРАНИЦЫ СКАЧИВАНИЯ
  // ==========================================
  const downloadAccess = document.getElementById('download-access');
  const downloadDenied = document.getElementById('download-denied');

  if (downloadAccess && downloadDenied) {
    const token = localStorage.getItem('token');
    
    if (token) {
      fetch('/api/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(user => {
        if (user.role === 'user') {
          // Если роль user — показываем бета-тест
          downloadAccess.style.display = 'none';
          downloadDenied.style.display = 'block';
        } else {
          // Если роль другая — даем скачать
          downloadAccess.style.display = 'block';
          downloadDenied.style.display = 'none';
        }
      })
      .catch(() => {
        // Если токен невалидный
        downloadAccess.style.display = 'none';
        downloadDenied.style.display = 'block';
      });
    } else {
      // Если не авторизован
      downloadAccess.style.display = 'none';
      downloadDenied.style.display = 'block';
    }
  }


  // ==========================================
  // 2. ЛОГИКА ДЛЯ КАБИНЕТА (ВХОД/ВЫХОД)
  // ==========================================
  const authBlock = document.getElementById('auth-block');
  const profileBlock = document.getElementById('profile-block');
  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  
  const btnLogoutX = document.getElementById('btn-logout-x');
  const logoutModal = document.getElementById('logout-modal');
  const btnCancelLogout = document.getElementById('btn-cancel-logout');
  const btnConfirmLogout = document.getElementById('btn-confirm-logout');
  
  const authError = document.getElementById('auth-error');

  // Проверка авторизации
  const token = localStorage.getItem('token');
  if (token && authBlock && profileBlock) {
    fetch('/api/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(user => {
      authBlock.style.display = 'none';
      profileBlock.style.display = 'block';

      document.getElementById('user-name').textContent = user.username;
      document.getElementById('user-date').textContent = user.register_date;
      
      const roleBadge = document.getElementById('user-role-badge');
      roleBadge.textContent = user.role.toUpperCase();
      roleBadge.className = 'role-badge';
      roleBadge.classList.add(`role-${user.role}`);

      loadVersionAndStatus();
    })
    .catch(() => {
      localStorage.removeItem('token');
      if(authBlock && profileBlock) showAuth();
    });
  } else if (authBlock && profileBlock) {
    showAuth();
  }

  // Вход
  if (btnLogin) {
    btnLogin.addEventListener('click', () => {
      const username = document.getElementById('auth-username').value;
      const password = document.getElementById('auth-password').value;

      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('token', data.token);
          window.location.reload();
        } else {
          showError(data.error);
        }
      });
    });
  }

  // Регистрация
  if (btnRegister) {
    btnRegister.addEventListener('click', () => {
      const username = document.getElementById('auth-username').value;
      const password = document.getElementById('auth-password').value;

      fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Регистрация успешна! Теперь войдите.');
        } else {
          showError(data.error);
        }
      });
    });
  }

  // Выход
  if (btnLogoutX) {
    btnLogoutX.addEventListener('click', () => {
      logoutModal.style.display = 'flex';
    });
  }

  if (btnCancelLogout) {
    btnCancelLogout.addEventListener('click', () => {
      logoutModal.style.display = 'none';
    });
  }

  if (btnConfirmLogout) {
    btnConfirmLogout.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.reload();
    });
  }

  function showAuth() {
    authBlock.style.display = 'block';
    profileBlock.style.display = 'none';
  }

  function showError(msg) {
    authError.textContent = msg;
    authError.style.display = 'block';
    setTimeout(() => authError.style.display = 'none', 3000);
  }

  function loadVersionAndStatus() {
    fetch('/launcher.json')
      .then(res => res.json())
      .then(data => {
        if (data.latest && document.getElementById('launcher-version')) {
          document.getElementById('launcher-version').textContent = `v${data.latest}`;
        }
      })
      .catch(() => {});

    fetch('/api/status.json')
      .then(res => res.json())
      .then(data => {
        if (document.getElementById('launcher-status')) {
          if (Array.isArray(data) && data[0] && data[0].main) {
            document.getElementById('launcher-status').textContent = `Status: ${data[0].main.status}`;
          } else if (data.main) {
            document.getElementById('launcher-status').textContent = `Status: ${data.main.status}`;
          }
        }
      })
      .catch(() => {
        if (document.getElementById('launcher-status')) {
          document.getElementById('launcher-status').textContent = `Status: offline`;
        }
      });
  }


  // ==========================================
  // 3. АНИМАЦИЯ ЧАСТИЦ
  // ==========================================
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, particles = [];
  const particleCount = 120, minSpeed = 6, maxSpeed = 15, minLength = 15, maxLength = 40, angle = Math.PI / 4;

  function resizeCanvas() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() { this.reset(); this.y = Math.random() * height; }
    reset() {
      this.x = Math.random() * width * 1.5; this.y = -Math.random() * height;
      this.speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
      this.length = Math.random() * (maxLength - minLength) + minLength;
      this.opacity = Math.random() * 0.3 + 0.1;
    }
    update() {
      this.y += this.speed; this.x -= this.speed * Math.tan(angle);
      if (this.y > height || this.x < -this.length) this.reset();
    }
    draw() {
      ctx.beginPath(); ctx.strokeStyle = `rgba(180, 180, 180, ${this.opacity})`; ctx.lineWidth = 1;
      ctx.moveTo(this.x, this.y); ctx.lineTo(this.x - this.length * Math.tan(angle), this.y + this.length); ctx.stroke();
    }
  }
  for (let i = 0; i < particleCount; i++) particles.push(new Particle());
  function animate() { ctx.clearRect(0, 0, width, height); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animate); }
  animate();
});
