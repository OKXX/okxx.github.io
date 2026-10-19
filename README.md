# 🌌 OKXX // QUANTUM CYBERSPACE

> **okxx.github.io** — 未来赛博科技全息个人静态站点。
> 采用纯原生 HTML5 Canvas 物理引擎、Web Audio API 算法声效及赛博朋克 HUD 视觉架构。零构建依赖，开箱即用。

---

## ✨ 核心视觉与动态特性

### 1. ⚛️ 交互式量子文字粒子系统 (`js/particle-text.js`)
- **像素点阵采样**：通过离屏 Canvas 实时采样 `OKXX` 字母点阵并转化为发光量子粒子。
- **弹簧力学与斥力场**：鼠标掠过时粒子受冲击波轰散爆炸，离开后如流体般平滑磁吸回弹。
- **动态形态变形 (Morphing)**：点击按钮或调用指令，粒子在 `OKXX`、`SYSTEMS`、`CYBERSPACE` 等词汇间无缝平滑重构。
- **冲击波触发**：画布点击触发物理震荡冲击波，粒子沿切线受激扩散。

### 2. 💥 全屏任意位置点击粒子特效 (`js/click-effects.js`)
- **任意位置点击激发**：无论点击空白处、按钮、卡片、终端或导航栏，均即时在顶层 Canvas 释放赛博爆破特效。
- **高能量子火花**：24~36个发光量子微粒以不同初速度、空气阻力与重力飞散，伴随旋转微型菱形芯片。
- **全息同心冲击波环**：内层实线发光环 + 外层全息虚线刻度环双重膨胀淡出。
- **辐射激光短线**：呈放射状激射而出的高亮电浆光束。
- **自适应节能休眠**：粒子完全消散后自动停止渲染循环，0% 闲置开销。

### 3. 🌐 多模式全屏动态背景引擎 (`js/background-canvas.js`)
支持通过右下角浮动控制坞或终端命令热切换 4 种沉浸式科技动效：
1. **⚛ 粒子网络 (Nexus)**：深空量子浮动节点，随距离动态计算光子连线与鼠标引力透镜。
2. **🌐 3D 赛博网格 (Grid)**：Synthwave / Tron 风格的 3D 地平线网格波浪与视差推进。
3. **💻 黑客矩阵雨 (Matrix)**：经典的数字瀑布流，高光首字符与荧光余晖拖尾。
4. **🚀 星际跃迁 (Warp)**：光速穿越超空间光束粒子，鼠标按下可触发极速加速。

### 4. 📡 全息 HUD 雷达与示波器系统 (`js/hud-canvas.js`)
- **雷达战术扫描仪**：360度旋转雷达扫描线、同心刻度环、信标点（Blips）感应高亮脉冲。
- **量子示波器与频谱柱**：双通道动态叠加正弦波与 24 频段实时音频频谱柱跳动。

### 5. 💻 仿真实交互式黑客终端 (`js/terminal.js`)
- 支持指令：`help`、`whoami`、`skills`、`projects`、`canvas <mode>`、`matrix`、`audio [on|off]`、`github`、`clear` 等。
- 支持上下按键切换历史指令，键盘敲击时伴随微电子打字音效。

### 6. 🔊 纯原生 Web Audio 赛博音效引擎 (`js/audio.js`)
- 零外部音频文件加载，使用纯数学波形（正弦波、方波、锯齿波）算法实时生成科技微按键声、跃迁音、扫描声。
- 支持右上角一键静音/解除静音，用户选择持久化保存（`localStorage`）。

### 7. 🎨 赛博朋克深空美学 (`css/style.css`)
- 霓虹电浆青（`#00f0ff`）、赛博紫（`#7000ff`）与荧光粉（`#ff007f`）冷暖碰撞。
- 扫描线滤镜（Scanline）、玻璃拟态（Glassmorphism）、切角多边形、动态光标跟随环。

---

## 🚀 目录结构

```text
okxx/
├── index.html               # 核心主页入口 (GitHub Pages 部署根节点)
├── favicon.svg              # 赛博朋克矢量图标
├── css/
│   └── style.css            # 科技感样式与动画设计
├── js/
│   ├── audio.js             # Web Audio 原生音效合成器
│   ├── click-effects.js     # 全屏任意位置点击粒子特效引擎
│   ├── background-canvas.js # 多模式背景 Canvas 动画
│   ├── particle-text.js     # Hero 交互文字粒子重构引擎
│   ├── hud-canvas.js        # HUD 雷达与示波器 Canvas
│   ├── terminal.js          # 交互式黑客终端控制台
│   └── main.js              # 全局控制器、解密字、FPS与光标
└── README.md                # 项目文档
```

---

## 🛠 本地预览

由于是纯原生静态结构，无需任何 Node.js 或构建工具：
1. **直接双击**：直接用任意现代浏览器（Chrome、Edge、Safari、Firefox）双击打开 `index.html`。
2. **轻量服务器预览**（推荐）：
   - VSCode 安装并运行 `Live Server` 插件；
   - 或在终端运行：
     ```bash
     # Python 3
     python -m http.server 8000
     ```
     然后访问 `http://localhost:8000`。

---

## 🌐 部署到 GitHub Pages (`okxx.github.io`)

1. 将当前目录初始化并推送到 GitHub 仓库：
   ```bash
   git init
   git add .
   git commit -m "feat: launch okxx cyber dynamic static portal"
   git branch -M main
   git remote add origin https://github.com/okxx/okxx.github.io.git
   git push -u origin main
   ```
2. 在 GitHub 仓库设置中确认：
   - 进入 **Settings** -> **Pages**。
   - Source 选择 **Deploy from a branch**。
   - Branch 选择 `main` / `root`。
3. 等待数十秒，访问 `https://okxx.github.io` 即可查看部署成果！

---

## 🔮 终端快捷命令预览

| 命令 | 描述 |
| :--- | :--- |
| `help` | 查看所有支持的终端指令列表 |
| `whoami` | 检视 @okxx 身份档案与极客使命 |
| `skills` | 输出能力雷达与系统模块掌握指数 |
| `projects` | 输出代表作品与开源仓库节点 |
| `canvas <mode>` | 实时切换背景模式 (`nexus` / `grid` / `matrix` / `warp`) |
| `matrix` | 立即激活黑客帝国绿光瀑布雨 |
| `audio` | 切换 Web Audio 赛博音效开关 |
| `clear` | 清空终端屏幕 |
