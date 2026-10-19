/**
 * Cyber HUD Canvas System
 * 绘制全息雷达扫描、动态波形示波器与多环刻度陀螺仪
 */
class CyberHUDCanvas {
  constructor(radarCanvasId, waveCanvasId) {
    this.radarCanvas = document.getElementById(radarCanvasId);
    this.waveCanvas = document.getElementById(waveCanvasId);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.radarAngle = 0;
    this.blips = [
      { r: 0.35, angle: 1.1, life: 1, text: 'NODE_ALPHA' },
      { r: 0.65, angle: 2.8, life: 1, text: 'NODE_BETA' },
      { r: 0.8, angle: 4.5, life: 1, text: 'SAT_OKXX' },
      { r: 0.45, angle: 5.6, life: 1, text: 'AI_AGENT' }
    ];

    this.wavePhase = 0;
    this.spectrumBars = new Array(24).fill(0).map(() => Math.random() * 0.8 + 0.1);

    this.initCanvases();
    this.initEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initCanvases() {
    if (this.radarCanvas) {
      const rect = this.radarCanvas.getBoundingClientRect();
      const size = Math.min(rect.width || 260, 320);
      this.radarWidth = size;
      this.radarHeight = size;
      this.radarCanvas.width = size * this.dpr;
      this.radarCanvas.height = size * this.dpr;
      this.radarCtx = this.radarCanvas.getContext('2d');
      this.radarCtx.scale(this.dpr, this.dpr);
    }

    if (this.waveCanvas) {
      const rect = this.waveCanvas.getBoundingClientRect();
      this.waveWidth = rect.width || 280;
      this.waveHeight = rect.height || 120;
      this.waveCanvas.width = this.waveWidth * this.dpr;
      this.waveCanvas.height = this.waveHeight * this.dpr;
      this.waveCtx = this.waveCanvas.getContext('2d');
      this.waveCtx.scale(this.dpr, this.dpr);
    }
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.initCanvases();
    });
  }

  renderRadar() {
    if (!this.radarCtx) return;
    const ctx = this.radarCtx;
    const w = this.radarWidth;
    const h = this.radarHeight;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = w * 0.44;

    ctx.clearRect(0, 0, w, h);

    // 外圈与刻度
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
    ctx.stroke();

    // 内部同心圆
    const rings = [0.25, 0.5, 0.75];
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let r of rings) {
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 十字刻度标尺
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(cx - maxR - 5, cy);
    ctx.lineTo(cx + maxR + 5, cy);
    ctx.moveTo(cx, cy - maxR - 5);
    ctx.lineTo(cx, cy + maxR + 5);
    ctx.stroke();

    // 旋转外刻度齿轮
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-this.radarAngle * 0.2);
    ctx.strokeStyle = 'rgba(112, 0, 255, 0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 36; i++) {
      const a = (i * Math.PI * 2) / 36;
      const len = i % 3 === 0 ? 8 : 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (maxR + 2), Math.sin(a) * (maxR + 2));
      ctx.lineTo(Math.cos(a) * (maxR + 2 + len), Math.sin(a) * (maxR + 2 + len));
      ctx.stroke();
    }
    ctx.restore();

    // 扫描扇区渐变
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.radarAngle);

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxR);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxR, -0.6, 0, false);
    ctx.closePath();
    ctx.fill();

    // 亮线扫描臂
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(maxR, 0);
    ctx.stroke();
    ctx.restore();

    // 绘制目标信标 (Blips)
    for (let blip of this.blips) {
      const bx = cx + Math.cos(blip.angle) * (maxR * blip.r);
      const by = cy + Math.sin(blip.angle) * (maxR * blip.r);

      // 计算与扫描线的角差
      let angleDiff = (this.radarAngle % (Math.PI * 2)) - (blip.angle % (Math.PI * 2));
      if (angleDiff < 0) angleDiff += Math.PI * 2;

      // 刚被扫过时充能高亮
      if (angleDiff < 0.2) {
        blip.life = 1;
      } else {
        blip.life = Math.max(0.1, blip.life - 0.006);
      }

      ctx.save();
      ctx.fillStyle = `rgba(0, 255, 136, ${blip.life})`;
      ctx.shadowBlur = 12 * blip.life;
      ctx.shadowColor = '#00ff88';

      ctx.beginPath();
      ctx.arc(bx, by, 3 + blip.life * 2, 0, Math.PI * 2);
      ctx.fill();

      // 目标文字标签
      if (blip.life > 0.4) {
        ctx.fillStyle = `rgba(0, 240, 255, ${blip.life})`;
        ctx.font = "9px 'Share Tech Mono', monospace";
        ctx.fillText(`[${blip.text}]`, bx + 6, by - 6);
      }
      ctx.restore();
    }

    this.radarAngle += 0.035;
  }

  renderWave() {
    if (!this.waveCtx) return;
    const ctx = this.waveCtx;
    const w = this.waveWidth;
    const h = this.waveHeight;

    ctx.clearRect(0, 0, w, h);

    // 绘制动态频谱柱状图
    const barCount = this.spectrumBars.length;
    const barWidth = (w - (barCount - 1) * 3) / barCount;

    for (let i = 0; i < barCount; i++) {
      // 随机目标微波动
      this.spectrumBars[i] += (Math.random() - 0.5) * 0.12;
      this.spectrumBars[i] = Math.max(0.08, Math.min(0.95, this.spectrumBars[i]));

      const barH = this.spectrumBars[i] * (h * 0.75);
      const x = i * (barWidth + 3);
      const y = h - barH;

      const grad = ctx.createLinearGradient(0, y, 0, h);
      grad.addColorStop(0, '#00f0ff');
      grad.addColorStop(0.5, '#7000ff');
      grad.addColorStop(1, 'rgba(112, 0, 255, 0.2)');

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barH);

      // 顶部发光微点
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y - 2, barWidth, 2);
    }

    // 叠加动态量子正弦波
    this.wavePhase += 0.06;
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00ff66';

    ctx.beginPath();
    for (let x = 0; x < w; x += 4) {
      const y = h * 0.4 + Math.sin(x * 0.04 + this.wavePhase) * 16 * Math.cos(x * 0.015);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  animate() {
    this.renderRadar();
    this.renderWave();
    requestAnimationFrame(this.animate);
  }
}

window.CyberHUDCanvas = CyberHUDCanvas;
