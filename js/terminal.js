/**
 * Interactive Cyber Terminal for OKXX
 * 仿黑客交互式命令行控制台
 */
class CyberTerminal {
  constructor(containerId, inputId, outputId) {
    this.container = document.getElementById(containerId);
    this.input = document.getElementById(inputId);
    this.output = document.getElementById(outputId);

    this.history = [];
    this.historyIndex = -1;

    this.commands = {
      help: () => this.cmdHelp(),
      whoami: () => this.cmdWhoami(),
      about: () => this.cmdWhoami(),
      skills: () => this.cmdSkills(),
      projects: () => this.cmdProjects(),
      canvas: (args) => this.cmdCanvas(args),
      matrix: () => this.cmdMatrix(),
      audio: (args) => this.cmdAudio(args),
      clear: () => this.cmdClear(),
      cls: () => this.cmdClear(),
      contact: () => this.cmdContact(),
      github: () => this.cmdGithub(),
      date: () => this.cmdDate(),
      sudo: () => this.cmdSudo(),
      echo: (args) => this.cmdEcho(args)
    };

    this.initEvents();
    this.printWelcome();
  }

  initEvents() {
    if (!this.input) return;

    this.input.addEventListener('keydown', (e) => {
      if (window.cyberAudio) {
        window.cyberAudio.playKeypress();
      }

      if (e.key === 'Enter') {
        const cmdLine = this.input.value.trim();
        if (cmdLine) {
          this.history.push(cmdLine);
          this.historyIndex = this.history.length;
          this.execute(cmdLine);
          this.input.value = '';
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.history.length > 0 && this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.history[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.input.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.input.value = '';
        }
      }
    });

    // 点击终端任意区域聚焦输入框
    if (this.container) {
      this.container.addEventListener('click', () => {
        this.input.focus();
      });
    }
  }

  print(text, type = 'normal') {
    const line = document.createElement('div');
    line.className = `terminal-line terminal-${type}`;
    line.innerHTML = text;
    this.output.appendChild(line);
    this.output.scrollTop = this.output.scrollHeight;
  }

  printWelcome() {
    this.print('<span class="t-cyan">╔═══════════════════════════════════════════════════════════╗</span>');
    this.print('<span class="t-cyan">║</span>  <span class="t-pink">OKXX QUANTUM TERMINAL</span> [Version 4.2.0-STABLE]              <span class="t-cyan">║</span>');
    this.print('<span class="t-cyan">║</span>  Logged in as: <span class="t-green">guest@okxx.github.io</span> (Authorized)           <span class="t-cyan">║</span>');
    this.print('<span class="t-cyan">║</span>  Type <span class="t-yellow">"help"</span> to view available system commands.             <span class="t-cyan">║</span>');
    this.print('<span class="t-cyan">╚═══════════════════════════════════════════════════════════╝</span>');
  }

  execute(cmdStr) {
    this.print(`<span class="t-prompt">okxx@nexus:~$</span> ${this.escapeHtml(cmdStr)}`, 'command');

    const parts = cmdStr.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (this.commands[cmd]) {
      this.commands[cmd](args);
    } else {
      this.print(`Command not found: "${cmd}". Type <span class="t-yellow">"help"</span> for command list.`, 'error');
    }
  }

  cmdHelp() {
    this.print('<span class="t-yellow">Available Commands:</span>');
    this.print('  <span class="t-cyan">whoami / about</span>   - 探索 OKXX 身份档案与技术架构');
    this.print('  <span class="t-cyan">skills</span>           - 查看核心全栈技术雷达与能量指数');
    this.print('  <span class="t-cyan">projects</span>         - 检视精选项目空间与代码仓库');
    this.print('  <span class="t-cyan">canvas &lt;mode&gt;</span>    - 切换背景 Canvas 模式 [nexus|grid|matrix|warp]');
    this.print('  <span class="t-cyan">matrix</span>           - 立即开启黑客帝国数字瀑布');
    this.print('  <span class="t-cyan">audio [on|off]</span>   - 切换声效合成器开关');
    this.print('  <span class="t-cyan">github / contact</span> - 打开 GitHub 个人主页与联系通道');
    this.print('  <span class="t-cyan">date</span>             - 打印当前系统量子时钟');
    this.print('  <span class="t-cyan">clear / cls</span>      - 清空终端屏幕');
  }

  cmdWhoami() {
    this.print('<span class="t-green">━━━━━━━━━━━━━ USER PROFILE: OKXX ━━━━━━━━━━━━━</span>');
    this.print('IDENTITY    : <b>OKXX</b> // Creative Developer & System Architect');
    this.print('WORKSPACE   : https://okxx.github.io');
    this.print('MISSION     : 探索前沿 Web 视效、Canvas 动力学、全栈架构与前沿极客创意');
    this.print('PHILOSOPHY  : "Code is poetry rendered into cyberspace."');
    this.print('STATUS      : 🟢 ONLINE - 24/7 Quantum Subroutine Active');
  }

  cmdSkills() {
    this.print('<span class="t-green">━━━━ CORE CAPABILITIES MATRIX ━━━━</span>');
    this.print('• HTML5 Canvas & WebGL 3D视觉  [██████████████████░░] 92%');
    this.print('• Modern JavaScript / TypeScript [████████████████████] 98%');
    this.print('• React / Vue / Full-Stack Infra [█████████████████░░░] 88%');
    this.print('• Cyber Aesthetic & Interaction  [████████████████████] 96%');
    this.print('• Algorithms & Performance Tuning[████████████████░░░░] 85%');
  }

  cmdProjects() {
    this.print('<span class="t-green">━━━━ DEPLOYED PROJECT NODES ━━━━</span>');
    this.print('1. <span class="t-cyan">OKXX Quantum Canvas</span>   - 极客全息科技个人网站与粒子引擎');
    this.print('2. <span class="t-cyan">Cyberpunk UI Lab</span>      - 赛博朋克玻璃拟态与 HUD 交互组件集');
    this.print('3. <span class="t-cyan">Audio Reactive Canvas</span> - 结合 Web Audio API 的音频流体可视化');
    this.print('4. <span class="t-cyan">Deep Web3 & AI Tools</span>  - 智能自动化与高维数据可视化方案');
    this.print('输入 <span class="t-yellow">github</span> 可一键前往官方主页检视所有代码仓库。');
  }

  cmdCanvas(args) {
    const mode = args[0] ? args[0].toLowerCase() : '';
    const validModes = ['nexus', 'grid', 'matrix', 'warp'];
    if (validModes.includes(mode)) {
      if (window.bgEngine) {
        window.bgEngine.setMode(mode);
        this.print(`Canvas 背景已切换为: <span class="t-green">${mode.toUpperCase()}</span>`);
      }
    } else {
      this.print(`Invalid mode! Usage: <span class="t-yellow">canvas &lt;nexus | grid | matrix | warp&gt;</span>`, 'error');
    }
  }

  cmdMatrix() {
    if (window.bgEngine) {
      window.bgEngine.setMode('matrix');
      this.print('<span class="t-green">Entering the Matrix... Wake up, Neo.</span>');
    }
  }

  cmdAudio(args) {
    if (!window.cyberAudio) return;
    const action = args[0] ? args[0].toLowerCase() : '';
    if (action === 'on') {
      if (window.cyberAudio.isMuted()) window.cyberAudio.toggleMute();
      this.print('Audio Synthesizer: <span class="t-green">ENABLED</span>');
    } else if (action === 'off') {
      if (!window.cyberAudio.isMuted()) window.cyberAudio.toggleMute();
      this.print('Audio Synthesizer: <span class="t-pink">DISABLED (Muted)</span>');
    } else {
      const state = window.cyberAudio.toggleMute() ? 'ENABLED' : 'DISABLED';
      this.print(`Audio Synthesizer toggled to: <span class="t-yellow">${state}</span>`);
    }
  }

  cmdContact() {
    this.print('GitHub Profile : <a href="https://github.com/okxx" target="_blank" class="t-cyan">https://github.com/okxx</a>');
    this.print('Website        : <a href="https://okxx.github.io" target="_blank" class="t-cyan">https://okxx.github.io</a>');
    this.print('Message Signal : Encrypted packet ready for dispatch.');
  }

  cmdGithub() {
    window.open('https://github.com/okxx', '_blank');
    this.print('Navigating to <span class="t-cyan">https://github.com/okxx</span> in a new tab...');
  }

  cmdDate() {
    this.print(`Current Quantum System Time: <span class="t-yellow">${new Date().toISOString()}</span>`);
  }

  cmdSudo() {
    this.print('<span class="t-pink">Permission Denied: User "guest" is not in the sudoers file. This incident will be reported to OKXX.</span>');
  }

  cmdEcho(args) {
    this.print(this.escapeHtml(args.join(' ')));
  }

  cmdClear() {
    this.output.innerHTML = '';
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }
}

window.CyberTerminal = CyberTerminal;
