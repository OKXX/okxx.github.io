/**
 * Main Application Controller for OKXX Cyber Portal
 * 整合启动自检、粒子引擎、终端、HUD、文字解密器、FPS监控及赛博光标
 */

// 文本解密乱码动画类
class TextScrambler {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________ABCDEF0123456789';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 30);
      const end = start + Math.floor(Math.random() * 30);
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span class="scramble-char">${char}</span>`;
      } else {
        output += from;
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

// 赛博光标跟随系统
class CyberCursor {
  constructor() {
    this.dot = document.getElementById('cursor-dot');
    this.ring = document.getElementById('cursor-ring');
    if (!this.dot || !this.ring) return;

    this.pos = { x: -100, y: -100 };
    this.target = { x: -100, y: -100 };

    window.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
      this.dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    });

    // 悬停交互元素时放大光环
    const interactiveElements = 'a, button, input, .interactive-card, .btn-cyber';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveElements)) {
        this.ring.classList.add('cursor-hover');
        if (window.cyberAudio) window.cyberAudio.playHover();
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveElements)) {
        this.ring.classList.remove('cursor-hover');
      }
    });

    this.render = this.render.bind(this);
    requestAnimationFrame(this.render);
  }

  render() {
    this.pos.x += (this.target.x - this.pos.x) * 0.18;
    this.pos.y += (this.target.y - this.pos.y) * 0.18;
    this.ring.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
    requestAnimationFrame(this.render);
  }
}

// 系统启动加载器
function initBootSequence() {
  const bootOverlay = document.getElementById('boot-overlay');
  const bootBar = document.getElementById('boot-progress-bar');
  const bootStatus = document.getElementById('boot-status-text');

  if (!bootOverlay) return;

  const logs = [
    'INITIATING QUANTUM KERNEL...',
    'MOUNTING NEURAL MATRIX DRIVER...',
    'CALIBRATING CANVAS PARTICLE ENGINE...',
    'CONNECTING TO OKXX CYBERSPACE...',
    'SYNCHRONIZING SYSTEM TELEMETRY...',
    'SYSTEM ONLINE. WELCOME.'
  ];

  let progress = 0;
  let logIdx = 0;

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 18) + 8;
    if (progress > 100) progress = 100;

    if (bootBar) bootBar.style.width = `${progress}%`;

    if (logIdx < logs.length && progress > (logIdx * 100) / logs.length) {
      if (bootStatus) bootStatus.innerText = logs[logIdx];
      logIdx++;
    }

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        bootOverlay.classList.add('fade-out');
        setTimeout(() => {
          bootOverlay.style.display = 'none';
        }, 600);
      }, 400);
    }
  }, 100);
}

// FPS 监控与系统时间
function initSystemMonitor() {
  const fpsEl = document.getElementById('hud-fps');
  const timeEl = document.getElementById('hud-time');

  let lastTime = performance.now();
  let frameCount = 0;

  function updateFPS() {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (now - lastTime));
      if (fpsEl) fpsEl.innerText = `${fps} FPS`;
      frameCount = 0;
      lastTime = now;
    }
    requestAnimationFrame(updateFPS);
  }
  requestAnimationFrame(updateFPS);

  function updateClock() {
    if (timeEl) {
      const d = new Date();
      timeEl.innerText = d.toTimeString().split(' ')[0] + ' UTC';
    }
  }
  setInterval(updateClock, 1000);
  updateClock();
}

// 主初始化逻辑
document.addEventListener('DOMContentLoaded', () => {
  // 1. 系统启动画面
  initBootSequence();

  // 2. 自定义鼠标光标
  new CyberCursor();

  // 3. 全局动态背景 Canvas
  window.bgEngine = new CyberBackgroundEngine('cyber-bg-canvas');

  // 4. Hero 粒子文字交互 Canvas
  window.particleText = new ParticleTextCanvas('particle-text-canvas');

  // 5. HUD 雷达与示波器 Canvas
  window.hudCanvas = new CyberHUDCanvas('radar-canvas', 'waveform-canvas');

  // 6. 赛博终端命令行
  window.terminal = new CyberTerminal('cyber-terminal', 'terminal-input', 'terminal-output');

  // 7. FPS 与实时状态
  initSystemMonitor();

  // 8. 副标题文字轮播解密动画
  const phrases = [
    'SYSTEM ARCHITECT & CREATIVE DEVELOPER',
    'EXPLORING CANVAS, WEBGL & CYBER AESTHETICS',
    'OPEN SOURCE ENTHUSIAST & CRAFTSMAN',
    'CONSTRUCTING FUTURE DIGITAL ARCHITECTURE'
  ];
  const scrambleEl = document.getElementById('hero-scramble-text');
  if (scrambleEl) {
    const scrambler = new TextScrambler(scrambleEl);
    let phraseCounter = 0;
    const nextPhrase = () => {
      scrambler.setText(phrases[phraseCounter]).then(() => {
        setTimeout(nextPhrase, 3600);
      });
      phraseCounter = (phraseCounter + 1) % phrases.length;
    };
    nextPhrase();
  }

  // 9. 模式切换按钮组绑定
  const modeButtons = document.querySelectorAll('.mode-btn');
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-mode');
      if (window.bgEngine) {
        window.bgEngine.setMode(mode);
      }
    });
  });

  // 10. 音频开关按钮
  const audioBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');
  if (audioBtn) {
    const updateAudioIcon = (isMuted) => {
      if (audioIcon) {
        audioIcon.innerText = isMuted ? '🔇' : '🔊';
      }
      if (isMuted) {
        audioBtn.classList.remove('sound-on');
      } else {
        audioBtn.classList.add('sound-on');
      }
    };

    updateAudioIcon(window.cyberAudio.isMuted());

    audioBtn.addEventListener('click', () => {
      const isMuted = !window.cyberAudio.toggleMute();
      updateAudioIcon(isMuted);
    });
  }

  // 11. 全屏切换按钮
  const fsBtn = document.getElementById('fullscreen-toggle-btn');
  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        fsBtn.innerText = '⛶';
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        fsBtn.innerText = '⛶';
      }
      if (window.cyberAudio) window.cyberAudio.playClick();
    });
  }

  // 12. 粒子文字手动重构按钮
  const morphBtn = document.getElementById('morph-text-btn');
  if (morphBtn) {
    morphBtn.addEventListener('click', () => {
      if (window.particleText) {
        window.particleText.morphToNextWord();
      }
    });
  }

  // 13. 快捷终端填充命令按钮
  const termQuickBtns = document.querySelectorAll('.term-quick-btn');
  termQuickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (window.terminal && cmd) {
        window.terminal.execute(cmd);
      }
    });
  });

  // 14. 平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        if (window.cyberAudio) window.cyberAudio.playClick();
      }
    });
  });
});
