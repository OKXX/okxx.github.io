/**
 * Interactive Particle Text Canvas Engine for OKXX
 * 交互式量子文字粒子系统：物理弹簧回弹、鼠标斥力力场、形态重构变换
 */
class ParticleTextCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.particles = [];
    this.words = ['OKXX', 'SYSTEMS', 'CYBERSPACE', 'INNOVATION'];
    this.currentWordIdx = 0;
    this.text = this.words[0];

    // 交互物理参数
    this.mouse = {
      x: -9999,
      y: -9999,
      radius: 120,
      active: false
    };

    this.spring = 0.055;
    this.friction = 0.88;
    this.interactionRadius = 130;
    this.densityStep = 5; // 点阵采样步长，适配性能与精细度

    this.initCanvasSize();
    this.initEvents();
    this.createTextParticles(this.text);

    // 字体加载完成重新精准采样
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        this.createTextParticles(this.text, true);
      }).catch(() => {});
    }

    this.animate = this.animate.bind(this);
    this.isRunning = true;
    requestAnimationFrame(this.animate);
  }

  initCanvasSize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = Math.max(rect.height, 360);

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.initCanvasSize();
      this.createTextParticles(this.text, true);
    });

    const updateMousePos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.active = true;
    };

    this.canvas.addEventListener('mousemove', updateMousePos);
    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
      this.mouse.active = false;
    });

    // 移动端触控支持
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.touches[0].clientX - rect.left;
        this.mouse.y = e.touches[0].clientY - rect.top;
        this.mouse.active = true;
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
      this.mouse.active = false;
    });

    // 点击爆裂冲击波效果
    this.canvas.addEventListener('click', (e) => {
      if (window.cyberAudio) window.cyberAudio.playClick();
      const rect = this.canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      this.shockwave(cx, cy, 250, 25);
    });
  }

  shockwave(x, y, radius = 200, force = 20) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const dx = p.x - x;
      const dy = p.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist < radius && dist > 0) {
        const angle = Math.atan2(dy, dx);
        const impulse = (1 - dist / radius) * force;
        p.vx += Math.cos(angle) * impulse;
        p.vy += Math.sin(angle) * impulse;
      }
    }
  }

  morphToNextWord() {
    this.currentWordIdx = (this.currentWordIdx + 1) % this.words.length;
    this.morphTo(this.words[this.currentWordIdx]);
  }

  morphTo(newWord) {
    this.text = newWord;
    this.createTextParticles(newWord, false);
    if (window.cyberAudio) window.cyberAudio.playWarp();
  }

  createTextParticles(text, preserveExisting = false) {
    // 使用离屏 canvas 采样文字像素
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

    offCanvas.width = this.width;
    offCanvas.height = this.height;

    // 自适应字号
    let fontSize = Math.min(this.width / (text.length * 0.65), 140);
    if (fontSize < 42) fontSize = 42;

    offCtx.fillStyle = '#ffffff';
    offCtx.font = `900 ${fontSize}px 'Orbitron', 'Share Tech Mono', sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(text, this.width / 2, this.height / 2);

    const imgData = offCtx.getImageData(0, 0, this.width, this.height);
    const data = imgData.data;
    const targetCoords = [];

    // 根据屏幕大小微调步长
    const step = this.width < 600 ? 5 : 4;

    for (let y = 0; y < this.height; y += step) {
      for (let x = 0; x < this.width; x += step) {
        const index = (y * this.width + x) * 4;
        const alpha = data[index + 3];
        if (alpha > 128) {
          // 加入微小随机抖动，让粒子更有科技感
          targetCoords.push({
            x: x + (Math.random() - 0.5) * 1.5,
            y: y + (Math.random() - 0.5) * 1.5
          });
        }
      }
    }

    // 霓虹调色板
    const colors = [
      '#00f0ff', // 霓虹青
      '#7000ff', // 赛博紫
      '#00a8ff', // 电光蓝
      '#ff007f', // 霓虹粉
      '#ffffff'  // 高光白
    ];

    const newParticles = [];
    const count = targetCoords.length;

    for (let i = 0; i < count; i++) {
      const target = targetCoords[i];
      let p;

      if (this.particles[i] && !preserveExisting) {
        // 重用现有粒子做形态变换过渡
        p = this.particles[i];
        p.originX = target.x;
        p.originY = target.y;
        p.vx += (Math.random() - 0.5) * 8;
        p.vy += (Math.random() - 0.5) * 8;
      } else {
        // 初始粒子从随机爆发点飞入
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 300 + 100;
        p = {
          x: target.x + Math.cos(angle) * dist,
          y: target.y + Math.sin(angle) * dist,
          originX: target.x,
          originY: target.y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          radius: Math.random() * 1.4 + 1.1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.4 + 0.6,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          pulseVal: Math.random() * Math.PI
        };
      }
      newParticles.push(p);
    }

    this.particles = newParticles;
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    const m = this.mouse;
    const pCount = this.particles.length;

    for (let i = 0; i < pCount; i++) {
      const p = this.particles[i];

      // 弹簧回位力
      const dxOrigin = p.originX - p.x;
      const dyOrigin = p.originY - p.y;
      p.vx += dxOrigin * this.spring;
      p.vy += dyOrigin * this.spring;

      // 阻尼摩擦
      p.vx *= this.friction;
      p.vy *= this.friction;

      // 鼠标斥力力场
      if (m.active) {
        const dxMouse = p.x - m.x;
        const dyMouse = p.y - m.y;
        const distMouse = Math.hypot(dxMouse, dyMouse);

        if (distMouse < this.interactionRadius && distMouse > 0) {
          const force = (1 - distMouse / this.interactionRadius) * 14;
          const angle = Math.atan2(dyMouse, dxMouse);
          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;
        }
      }

      // 位置更新
      p.x += p.vx;
      p.y += p.vy;

      // 呼吸脉动
      p.pulseVal += p.pulseSpeed;
      const currentAlpha = p.alpha * (0.8 + 0.2 * Math.sin(p.pulseVal));

      // 绘制粒子光芒
      this.ctx.save();
      this.ctx.globalAlpha = currentAlpha;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 局部粒子微弱连线（增强科技感网络感）
    this.ctx.save();
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i < Math.min(pCount, 400); i += 3) {
      const p1 = this.particles[i];
      for (let j = i + 1; j < Math.min(i + 8, pCount); j += 2) {
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 650) { // 距离小于 25px
          const alpha = (1 - Math.sqrt(d2) / 25.5) * 0.25;
          this.ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }
    this.ctx.restore();

    requestAnimationFrame(this.animate);
  }
}

window.ParticleTextCanvas = ParticleTextCanvas;
