/**
 * Universal Click Particle Effects Engine for OKXX
 * 全屏任意位置鼠标点击高能量子粒子特效系统
 * 特性：动态冲击波环、发光量子火花、旋转菱形微晶片、辐射光纤线、自适应休眠省电
 */
class ClickParticleFX {
  constructor(canvasId = 'click-fx-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      document.body.appendChild(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.particles = [];
    this.shockwaves = [];
    this.sparks = [];

    this.colors = [
      '#00f0ff', // 霓虹青
      '#7000ff', // 赛博紫
      '#ff007f', // 霓虹热粉
      '#00ff88', // 矩阵绿
      '#38bdf8', // 电光蓝
      '#ffffff'  // 高光白
    ];

    this.isAnimating = false;

    this.initCanvasSize();
    this.initEvents();
  }

  initCanvasSize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.initCanvasSize();
    });

    // 监听全局指针按下（支持鼠标左键与触控）
    window.addEventListener('pointerdown', (e) => {
      // 允许点击发生（只响应鼠标左键或触摸）
      if (e.button !== undefined && e.button !== 0) return;
      this.createBurst(e.clientX, e.clientY);

      // 联动赛博音频
      if (window.cyberAudio) {
        window.cyberAudio.playClick();
      }
    }, { passive: true });
  }

  createBurst(x, y) {
    const particleCount = Math.floor(Math.random() * 12) + 24; // 24-36 个粒子

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      const isDiamond = Math.random() < 0.25; // 25% 几率为科技菱形

      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 1.5,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        alpha: 1,
        decay: Math.random() * 0.025 + 0.018,
        gravity: 0.08,
        friction: 0.94,
        isDiamond: isDiamond,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2
      });
    }

    // 冲击波扩散环（双重能量环：内层实线、外层虚线全息环）
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: Math.random() * 30 + 55,
      growth: 3.5,
      alpha: 0.85,
      decay: 0.038,
      color: this.colors[Math.floor(Math.random() * 3)] // 偏向主色调
    });

    // 随机辐射激光短线
    const sparkCount = 6;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (i * Math.PI * 2) / sparkCount + (Math.random() - 0.5) * 0.4;
      this.sparks.push({
        x: x,
        y: y,
        angle: angle,
        length: 6,
        maxLength: Math.random() * 25 + 15,
        speed: Math.random() * 4 + 3,
        alpha: 1,
        decay: 0.045,
        color: '#00f0ff'
      });
    }

    if (!this.isAnimating) {
      this.isAnimating = true;
      requestAnimationFrame(this.animate.bind(this));
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. 渲染与更新冲击波环
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.growth;
      sw.alpha -= sw.decay;

      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = sw.color;

      // 内环（细光环）
      this.ctx.beginPath();
      this.ctx.strokeStyle = sw.color;
      this.ctx.globalAlpha = sw.alpha;
      this.ctx.lineWidth = 1.8;
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.stroke();

      // 外环（全息刻度虚线环）
      this.ctx.beginPath();
      this.ctx.strokeStyle = sw.color;
      this.ctx.globalAlpha = sw.alpha * 0.5;
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([4, 6]);
      this.ctx.arc(sw.x, sw.y, sw.radius * 1.25, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.restore();
    }

    // 2. 渲染与更新辐射激光短线
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.length += sp.speed;
      sp.alpha -= sp.decay;

      if (sp.alpha <= 0 || sp.length >= sp.maxLength) {
        this.sparks.splice(i, 1);
        continue;
      }

      const endX = sp.x + Math.cos(sp.angle) * sp.length;
      const endY = sp.y + Math.sin(sp.angle) * sp.length;
      const startX = sp.x + Math.cos(sp.angle) * (sp.length * 0.4);
      const startY = sp.y + Math.sin(sp.angle) * (sp.length * 0.4);

      this.ctx.save();
      this.ctx.strokeStyle = sp.color;
      this.ctx.globalAlpha = sp.alpha;
      this.ctx.lineWidth = 1.5;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = sp.color;

      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 3. 渲染与更新粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;

      p.x += p.vx;
      p.y += p.vy;

      p.alpha -= p.decay;
      p.size = Math.max(0.2, p.size - 0.02);
      p.rotation += p.spin;

      if (p.alpha <= 0 || p.size <= 0.2) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;

      if (p.isDiamond) {
        // 绘制赛博旋转菱形
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size * 1.5);
        this.ctx.lineTo(p.size, 0);
        this.ctx.lineTo(0, p.size * 1.5);
        this.ctx.lineTo(-p.size, 0);
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        // 绘制圆光量子
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    // 若无任何活动特效，则暂停循环节省能耗
    if (this.particles.length > 0 || this.shockwaves.length > 0 || this.sparks.length > 0) {
      requestAnimationFrame(this.animate.bind(this));
    } else {
      this.isAnimating = false;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
}

window.ClickParticleFX = ClickParticleFX;
