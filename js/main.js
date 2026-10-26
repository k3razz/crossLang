document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles = [];
  const particleCount = 120, minSpeed = 6, maxSpeed = 15, minLength = 15, maxLength = 40, angle = Math.PI / 4;

  function resizeCanvas() { 
    width = canvas.width = window.innerWidth; 
    height = canvas.height = window.innerHeight; 
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() { 
      this.reset(); 
      this.y = Math.random() * height; 
    }
    reset() {
      this.x = Math.random() * width * 1.5; 
      this.y = -Math.random() * height;
      this.speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
      this.length = Math.random() * (maxLength - minLength) + minLength;
      this.opacity = Math.random() * 0.3 + 0.1;
    }
    update() {
      this.y += this.speed; 
      this.x -= this.speed * Math.tan(angle);
      if (this.y > height || this.x < -this.length) this.reset();
    }
    draw() {
      ctx.beginPath(); 
      ctx.strokeStyle = `rgba(180, 180, 180, ${this.opacity})`; 
      ctx.lineWidth = 1;
      ctx.moveTo(this.x, this.y); 
      ctx.lineTo(this.x - this.length * Math.tan(angle), this.y + this.length); 
      ctx.stroke();
    }
  }

  for (let i = 0; i < particleCount; i++) particles.push(new Particle());
  
  function animate() { 
    ctx.clearRect(0, 0, width, height); 
    particles.forEach(p => { p.update(); p.draw(); }); 
    requestAnimationFrame(animate); 
  }
  
  animate();
});
