/**
 * Cyber Audio Engine using Web Audio API
 * 纯原生算法合成，零外部资源依赖
 */
class CyberAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    // 首次进入默认静音，避免突然音效打扰，提供舒畅体验
    this.muted = localStorage.getItem('okxx_audio_muted') !== null 
      ? localStorage.getItem('okxx_audio_muted') === 'true' 
      : true;
    this.masterGain = null;
    this.initAudioContext();
  }

  initAudioContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      try {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.muted ? 0 : 0.15; // 舒适音量
        this.masterGain.connect(this.ctx.destination);
      } catch (e) {
        console.warn('Web Audio not supported:', e);
      }
    }
  }

  unlock() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.enabled = true;
      });
    } else if (this.ctx) {
      this.enabled = true;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('okxx_audio_muted', this.muted);
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.15, this.ctx.currentTime);
    }
    if (!this.muted) {
      this.unlock();
      this.playBeep(880, 0.1, 'sine');
    }
    return !this.muted;
  }

  isMuted() {
    return this.muted;
  }

  playBeep(freq = 440, duration = 0.08, type = 'sine') {
    if (!this.ctx || this.muted) return;
    this.unlock();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // 忽略音频错误
    }
  }

  playHover() {
    if (this.muted) return;
    this.playBeep(1200, 0.04, 'sine');
  }

  playClick() {
    if (this.muted) return;
    if (!this.ctx) return;
    this.unlock();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {}
  }

  playKeypress() {
    if (this.muted) return;
    const freqs = [1800, 2000, 2200, 2400];
    const freq = freqs[Math.floor(Math.random() * freqs.length)];
    this.playBeep(freq, 0.02, 'square');
  }

  playWarp() {
    if (this.muted || !this.ctx) return;
    this.unlock();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
  }

  playScan() {
    if (this.muted || !this.ctx) return;
    this.unlock();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(400, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  }
}

// 实例化全局音频控制器
window.cyberAudio = new CyberAudioEngine();
