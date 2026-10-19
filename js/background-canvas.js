/**
 * Sci-Fi Background Canvas Engine for OKXX
 * 支持 4 种可动态热切换的沉浸式科技视觉模式：
 * 1. nexus: 量子神经元星网 (Neural Quantum Nexus)
 * 2. grid: 3D 赛博网格地平线 (Cyber Grid Wavefield)
 * 3. matrix: 数字黑客流光雨 (Digital Rain)
 * 4. warp: 超空间虫洞跃迁 (Hyperspace Warp)
 */
class CyberBackgroundEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.modes = ['nexus', 'grid', 'matrix', 'warp'];
    this.currentMode = 'nexus';

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.mouse = {
      x: this.width / 2,
      y: this.height / 2,
      targetX: this.width / 2,
      targetY: this.height / 2,
      isDown: false
    };

    this.time = 0;
    this.initCanvasSize();
    this.initEvents();
    this.initCurrentModeData();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
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
      this.initCurrentModeData();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
    });

    window.addEventListener('mousedown', () => {
      this.mouse.isDown = true;
    });

    window.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.targetX = e.touches[0].clientX;
        this.mouse.targetY = e.touches[0].clientY;
      }
    }, { passive: true });
  }

  setMode(mode) {
    if (!this.modes.includes(mode)) return;
    this.currentMode = mode;
    this.initCurrentModeData();
    if (window.cyberAudio) {
      window.cyberAudio.playWarp();
    }
  }

  initCurrentModeData() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.currentMode === 'nexus') {
      // 粒子数量适配屏幕
      const count = Math.floor((this.width * this.height) / 10000);
      this.nexusParticles = [];
      const colors = ['#00f0ff', '#7000ff', '#00ff88', '#38bdf8'];

      for (let i = 0; i < Math.min(count, 130); i++) {
        this.nexusParticles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: Math.random() * 2 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.5 + 0.3
        });
      }
    } else if (this.currentMode === 'matrix') {
      this.matrixChars = '0123456789ABCDEF<>+-*/={};:OKXX';
      this.matrixFontSize = 14;
      this.matrixColumns = Math.floor(this.width / this.matrixFontSize);
      this.matrixDrops = [];
      for (let i = 0; i < this.matrixColumns; i++) {
        this.matrixDrops[i] = Math.floor(Math.random() * -50);
      }
    } else if (this.currentMode === 'warp') {
      this.warpStars = [];
      const starCount = 350;
      for (let i = 0; i < starCount; i++) {
        this.warpStars.push({
          x: (Math.random() - 0.5) * this.width * 2,
          y: (Math.random() - 0.5) * this.height * 2,
          z: Math.random() * this.width,
          pz: 0
        });
        this.warpStars[i].pz = this.warpStars[i].z;
      }
    }
  }

  renderNexus() {
    // 平滑渐隐背景
    this.ctx.fillStyle = 'rgba(5, 8, 17, 0.25)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const pts = this.nexusParticles;
    const count = pts.length;

    // 鼠标缓动
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

    for (let i = 0; i < count; i++) {
      const p = pts[i];
      p.x += p.vx;
      p.y += p.vy;

      // 屏幕边缘反弹
      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;

      // 鼠标引力
      const dxM = this.mouse.x - p.x;
      const dyM = this.mouse.y - p.y;
      const distM = Math.hypot(dxM, dyM);
      if (distM < 160 && distM > 0) {
        const pull = (1 - distM / 160) * 0.5;
        p.x += (dxM / distM) * pull;
        p.y += (dyM / distM) * pull;
      }

      // 绘制粒子
      this.ctx.save();
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // 节点间连线
      for (let j = i + 1; j < count; j++) {
        const p2 = pts[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 110) {
          const lineAlpha = (1 - dist / 110) * 0.28;
          this.ctx.save();
          this.ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
          this.ctx.restore();
        }
      }

      // 与鼠标连线
      if (distM < 140) {
        const lineAlpha = (1 - distM / 140) * 0.45;
        this.ctx.save();
        this.ctx.strokeStyle = `rgba(112, 0, 255, ${lineAlpha})`;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(this.mouse.x, this.mouse.y);
        this.ctx.stroke();
        this.ctx.restore();
      }
    }
  }

  renderGrid() {
    this.ctx.fillStyle = '#050811';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const horizon = this.height * 0.52;
    const fov = 300;

    // 绘制地平线辉光
    const grad = this.ctx.createLinearGradient(0, horizon - 80, 0, horizon + 120);
    grad.addColorStop(0, 'rgba(5, 8, 17, 0)');
    grad.addColorStop(0.4, 'rgba(112, 0, 255, 0.35)');
    grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.45)');
    grad.addColorStop(1, 'rgba(5, 8, 17, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, horizon - 80, this.width, 200);

    // 绘制地平线
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, horizon);
    this.ctx.lineTo(this.width, horizon);
    this.ctx.stroke();

    const speed = 1.2;
    const gridOffset = (this.time * speed) % 40;

    // 绘制纵向透视线
    const centerX = this.width / 2 + (this.mouse.targetX - this.width / 2) * 0.15;
    const numVLines = 36;
    for (let i = -numVLines; i <= numVLines; i++) {
      const bottomX = centerX + i * 55;
      this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, horizon);
      this.ctx.lineTo(bottomX, this.height);
      this.ctx.stroke();
    }

    // 绘制横向波浪线（透视与正弦波叠加）
    const numHLines = 22;
    for (let i = 1; i <= numHLines; i++) {
      const p = (i * 40 - gridOffset) / (numHLines * 40);
      if (p <= 0 || p >= 1) continue;

      const y = horizon + Math.pow(p, 1.8) * (this.height - horizon);
      const alpha = Math.min(p * 0.8, 0.5);

      this.ctx.strokeStyle = `rgba(112, 0, 255, ${alpha})`;
      this.ctx.lineWidth = 1 + p * 1.5;

      this.ctx.beginPath();
      for (let x = 0; x <= this.width; x += 30) {
        const wave = Math.sin(x * 0.012 + this.time * 0.05 + i) * (12 * p);
        if (x === 0) {
          this.ctx.moveTo(x, y + wave);
        } else {
          this.ctx.lineTo(x, y + wave);
        }
      }
      this.ctx.stroke();
    }
  }

  renderMatrix() {
    this.ctx.fillStyle = 'rgba(5, 8, 17, 0.12)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.font = `${this.matrixFontSize}px 'Share Tech Mono', monospace`;

    for (let i = 0; i < this.matrixDrops.length; i++) {
      const char = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
      const x = i * this.matrixFontSize;
      const y = this.matrixDrops[i] * this.matrixFontSize;

      // 龙头高光白绿色
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = '#00ff66';
      this.ctx.fillText(char, x, y);

      // 下一部分青绿色
      const trailChar = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
      this.ctx.fillStyle = '#00ff88';
      this.ctx.shadowBlur = 4;
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.fillText(trailChar, x, y - this.matrixFontSize);

      if (y > this.height && Math.random() > 0.975) {
        this.matrixDrops[i] = 0;
      }
      this.matrixDrops[i]++;
    }
  }

  renderWarp() {
    this.ctx.fillStyle = 'rgba(5, 8, 17, 0.35)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const cx = this.width / 2 + (this.mouse.targetX - this.width / 2) * 0.2;
    const cy = this.height / 2 + (this.mouse.targetY - this.height / 2) * 0.2;
    const speed = this.mouse.isDown ? 35 : 16;

    for (let i = 0; i < this.warpStars.length; i++) {
      const star = this.warpStars[i];
      star.z -= speed;

      if (star.z <= 0) {
        star.z = this.width;
        star.x = (Math.random() - 0.5) * this.width * 2;
        star.y = (Math.random() - 0.5) * this.height * 2;
        star.pz = star.z;
      }

      const k = 280 / star.z;
      const px = star.x * k + cx;
      const py = star.y * k + cy;

      const pk = 280 / star.pz;
      const prevX = star.x * pk + cx;
      const prevY = star.y * pk + cy;

      star.pz = star.z;

      if (px >= 0 && px <= this.width && py >= 0 && py <= this.height) {
        const alpha = Math.min((1 - star.z / this.width) * 1.5, 1);
        this.ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
        this.ctx.lineWidth = (1 - star.z / this.width) * 2.5 + 0.8;
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = '#00f0ff';

        this.ctx.beginPath();
        this.ctx.moveTo(prevX, prevY);
        this.ctx.lineTo(px, py);
        this.ctx.stroke();
      }
    }
  }

  animate() {
    this.time += 0.8;

    if (this.currentMode === 'nexus') {
      this.renderNexus();
    } else if (this.currentMode === 'grid') {
      this.renderGrid();
    } else if (this.currentMode === 'matrix') {
      this.renderMatrix();
    } else if (this.currentMode === 'warp') {
      this.renderWarp();
    }

    requestAnimationFrame(this.animate);
  }
}

window.CyberBackgroundEngine = CyberBackgroundEngine;
