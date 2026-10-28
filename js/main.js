document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. ПРОВЕРКА СТАТУСА API / БАЗЫ ДАННЫХ
  // ==========================================
  // Пример запроса к вашему API (статус сервера)
  // Если у вас нет реального эндпоинта, можно проверить launcher.json
  window.checkStatus = function() {
    const statusBox = document.getElementById('api-status-box');
    const statusText = document.getElementById('api-status-text');
    
    statusBox.style.display = 'block';
    statusText.textContent = 'Проверка соединения...';
    statusText.className = '';
    
    // Делаем запрос к api/status.json (должен быть у вас в папке api/)
    fetch('/api/status.json')
      .then(res => {
        if (!res.ok) throw new Error('404');
        return res.json();
      })
      .then(data => {
        // Предполагаем формат [{"main": {"status": "beta"}}] или {"main": {"status": "beta"}}
        let status = 'unknown';
        if (Array.isArray(data) && data[0] && data[0].main) {
          status = data[0].main.status;
        } else if (data.main) {
          status = data.main.status;
        }
        
        statusText.innerHTML = `Статус API: <span class="api-ok">${status.toUpperCase()}</span>`;
      })
      .catch(err => {
        statusText.innerHTML = `Ошибка подключения к API: <span class="api-error">OFFLINE</span>`;
        console.error(err);
      });
  };


  // ==========================================
  // 2. ПИКСЕЛЬНЫЙ "ДОЖДЬ" НА ФОНЕ
  // ==========================================
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles = [];
  
  // Настройки для пиксельного стиля
  const particleCount = 50; // Меньше частиц, чтобы не мешали
  const minSpeed = 2;        
  const maxSpeed = 5;       
  const minSize = 2;
  const maxSize = 4; // Квадратики, а не линии

  function resizeCanvas() { 
    width = canvas.width = window.innerWidth; 
    height = canvas.height = window.innerHeight; 
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class PixelParticle {
    constructor() { 
      this.reset(); 
      this.y = Math.random() * height; 
    }
    reset() {
      this.x = Math.random() * width; 
      this.y = -Math.random() * 100; 
      this.speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
      this.size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
      this.opacity = Math.random() * 0.3 + 0.1;
    }
    update() {
      this.y += this.speed;
      if (this.y > height) this.reset();
    }
    draw() {
      ctx.fillStyle = `rgba(200, 200, 200, ${this.opacity})`;
      ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
    }
  }

  for (let i = 0; i < particleCount; i++) particles.push(new PixelParticle());
  
  function animate() { 
    ctx.clearRect(0, 0, width, height); 
    particles.forEach(p => { p.update(); p.draw(); }); 
    requestAnimationFrame(animate); 
  }
  
  animate();
});
