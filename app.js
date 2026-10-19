(() => {
  "use strict";

  const canvas = document.querySelector("#universe");
  const context = canvas.getContext("2d");
  const hero = document.querySelector(".hero");
  const motionButton = document.querySelector("#motion-toggle");
  const fpsValue = document.querySelector("#fps-value");
  const modeButtons = [...document.querySelectorAll("[data-mode]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const narrowScreen = window.matchMedia("(max-width: 760px)");
  const fullCircle = Math.PI * 2;
  const pointer = { x: 0, y: 0, active: false };
  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    mode: "orbit",
    time: 0,
    paused: reducedMotion.matches,
    inView: true,
    frame: 0,
    previousTime: 0,
    lastFpsTime: 0,
    frameCount: 0,
    fps: 0,
  };
  let particles = [];
  let stars = [];
  let pulses = [];
  let resizeTimer;
  let rotation = { spinCos: 1, spinSin: 0, xCos: 1, xSin: 0, zCos: 1, zSin: 0 };

  /** 生成固定分布，避免窗口缩放或场景切换时粒子无规则闪烁。 */
  function seededRandom(seed) {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  }

  /** 按屏幕面积控制粒子数量，并限制像素倍率，兼顾高分屏清晰度与移动端耗电。 */
  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    state.width = rect.width;
    state.height = rect.height;
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * state.dpr);
    canvas.height = Math.round(rect.height * state.dpr);
    context?.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    const count = narrowScreen.matches ? 1100 : 2300;
    particles = Array.from({ length: count }, (_, index) => {
      const u = seededRandom(index + 1);
      const v = seededRandom(index + 5001);
      const w = seededRandom(index + 9001);
      return {
        u,
        v,
        w,
        x: 0,
        y: 0,
        z: 0,
        size: 0.45 + w * 1.15,
        color: index % 5 === 0 ? "cyan" : index % 7 === 0 ? "white" : "green",
      };
    });
    stars = Array.from(
      { length: narrowScreen.matches ? 65 : 145 },
      (_, index) => ({
        x: seededRandom(index + 12001),
        y: seededRandom(index + 15001),
        size: 0.3 + seededRandom(index + 18001) * 0.8,
        phase: seededRandom(index + 21001) * fullCircle,
      }),
    );
    document.querySelector(".interaction-hint").innerHTML = narrowScreen.matches
      ? '<span class="hint-icon" aria-hidden="true">⌖</span> 点击粒子场，释放能量脉冲'
      : '<span class="hint-icon" aria-hidden="true">⌖</span> 移动鼠标扰动粒子 · 点击释放脉冲';
    // 缩放时直接收敛到当前形态，防止旧坐标使粒子从页面外飞入。
    setParticlePositions(true);
    drawScene();
  }

  /** 将相同粒子映射为环面、旋臂星云或球面，让切换保持连续的空间运动。 */
  function setParticlePositions(immediate = false) {
    const t = state.time;
    for (const particle of particles) {
      const angle = particle.u * fullCircle;
      let x, y, z;
      if (state.mode === "orbit") {
        const tubeAngle = particle.v * fullCircle;
        const radius =
          0.93 +
          (0.22 + 0.055 * Math.sin(angle * 3 + t * 0.45)) * Math.cos(tubeAngle);
        x = radius * Math.cos(angle);
        y = radius * Math.sin(angle);
        z = 0.25 * Math.sin(tubeAngle) + 0.04 * Math.sin(angle * 5 + t * 0.5);
      } else if (state.mode === "galaxy") {
        const radius = Math.sqrt(particle.u) * 1.42;
        const arm = Math.floor(particle.v * 4);
        const spiral =
          radius * 3.8 + (arm * Math.PI) / 2 + (particle.w - 0.5) * 0.6;
        x = Math.cos(spiral) * radius;
        y = Math.sin(spiral) * radius;
        z = (particle.v * 4 - arm - 0.5) * 0.14 * (1.5 - radius);
      } else {
        const phi = Math.acos(1 - 2 * particle.v);
        const radius =
          0.97 + 0.045 * Math.sin(angle * 6 + t * 0.6) * Math.sin(phi * 4);
        x = radius * Math.sin(phi) * Math.cos(angle);
        y = radius * Math.sin(phi) * Math.sin(angle);
        z = radius * Math.cos(phi);
      }
      const blend = immediate ? 1 : 0.045;
      particle.x += (x - particle.x) * blend;
      particle.y += (y - particle.y) * blend;
      particle.z += (z - particle.z) * blend;
    }
  }

  /** 将三维坐标投影到二维画布；缓慢自转与指针视差共同维持空间感。 */
  function project(x, y, z, scale, centerX, centerY) {
    const sx = x * rotation.spinCos - y * rotation.spinSin;
    const sy = x * rotation.spinSin + y * rotation.spinCos;
    const ry = sy * rotation.xCos - z * rotation.xSin;
    const rz = sy * rotation.xSin + z * rotation.xCos;
    const rx = sx * rotation.zCos - ry * rotation.zSin;
    const fy = sx * rotation.zSin + ry * rotation.zCos;
    const perspective = 3.8 / (3.8 + rz);
    return {
      x: centerX + rx * scale * perspective,
      y: centerY + fy * scale * perspective,
      z: rz,
      perspective,
    };
  }

  /** 叠加星点、轨道参考线、实体粒子与点击波纹，所有装饰都绘制在同一画布。 */
  function drawScene() {
    if (!context) return;
    const { width, height, time } = state;
    const mobile = narrowScreen.matches;
    const centerX = mobile ? width * 0.52 : width * 0.743;
    const centerY = mobile ? 700 : height * 0.495;
    const scale = mobile
      ? Math.min(width * 0.39, 200)
      : Math.min(width * 0.205, height * 0.34);
    // 同一帧共用旋转矩阵，避免为每个粒子重复计算相同的三角函数。
    const rotationX =
      0.87 + (pointer.active ? ((pointer.y - centerY) / height) * 0.16 : 0);
    const rotationZ =
      -0.48 + (pointer.active ? ((pointer.x - centerX) / width) * 0.12 : 0);
    rotation = {
      spinCos: Math.cos(time * 0.09),
      spinSin: Math.sin(time * 0.09),
      xCos: Math.cos(rotationX),
      xSin: Math.sin(rotationX),
      zCos: Math.cos(rotationZ),
      zSin: Math.sin(rotationZ),
    };
    context.clearRect(0, 0, width, height);

    const glow = context.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      scale * 1.65,
    );
    glow.addColorStop(0, "#81ab5714");
    glow.addColorStop(0.42, "#4d965112");
    glow.addColorStop(1, "#080b0e00");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    for (const star of stars) {
      // 移动端上半屏保持安静，避免星点干扰个人介绍的阅读。
      const alpha =
        mobile && star.y * height < 540
          ? 0.12
          : 0.18 + (0.25 * (Math.sin(time * 0.5 + star.phase) + 1)) / 2;
      context.fillStyle = `rgba(167,193,174,${alpha})`;
      context.fillRect(star.x * width, star.y * height, star.size, star.size);
    }

    context.save();
    context.translate(centerX, centerY);
    context.rotate(-0.48);
    context.lineWidth = 0.6;
    context.strokeStyle = "#8bb88126";
    context.setLineDash([2, 9]);
    context.beginPath();
    context.ellipse(0, 0, scale * 1.45, scale * 0.88, 0, 0, fullCircle);
    context.stroke();
    context.setLineDash([]);
    context.strokeStyle = "#8bb88114";
    context.beginPath();
    context.ellipse(0, 0, scale * 1.57, scale * 0.95, 0, -0.4, 1.9);
    context.stroke();
    // 轨道刻度用于强化仪器视觉，使用稀疏线段避免喧宾夺主。
    for (let index = 0; index < 48; index++) {
      const angle = (index / 48) * fullCircle;
      context.strokeStyle = index % 4 === 0 ? "#a6cf7055" : "#a6cf7022";
      context.beginPath();
      context.moveTo(
        Math.cos(angle) * scale * 1.45,
        Math.sin(angle) * scale * 0.88,
      );
      context.lineTo(
        Math.cos(angle) * scale * (index % 4 === 0 ? 1.49 : 1.47),
        Math.sin(angle) * scale * (index % 4 === 0 ? 0.91 : 0.895),
      );
      context.stroke();
    }
    context.restore();

    // 屏幕混合让交叠粒子自然发亮，无需逐粒子使用昂贵的模糊滤镜。
    context.globalCompositeOperation = "lighter";
    // 沿三维轨道移动的光点与拖尾，强调不同深度的运动方向。
    for (let orbit = 0; orbit < 3; orbit++) {
      const headAngle = time * (0.22 + orbit * 0.07) + orbit * 2.1;
      const radius = 1.31 + orbit * 0.045;
      context.beginPath();
      for (let segment = 0; segment <= 35; segment++) {
        const angle = headAngle - 0.7 + segment * 0.02;
        const position = project(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          Math.sin(angle * 2 + orbit) * 0.12,
          scale,
          centerX,
          centerY,
        );
        if (segment === 0) context.moveTo(position.x, position.y);
        else context.lineTo(position.x, position.y);
      }
      context.lineWidth = 0.75;
      context.strokeStyle = orbit === 1 ? "#8be4dc55" : "#c4f86a55";
      context.stroke();
      const head = project(
        Math.cos(headAngle) * radius,
        Math.sin(headAngle) * radius,
        Math.sin(headAngle * 2 + orbit) * 0.12,
        scale,
        centerX,
        centerY,
      );
      context.fillStyle = orbit === 1 ? "#9aeee6" : "#d8ff98";
      context.beginPath();
      context.arc(head.x, head.y, 1.7, 0, fullCircle);
      context.fill();
    }
    for (const particle of particles) {
      const point = project(
        particle.x,
        particle.y,
        particle.z,
        scale,
        centerX,
        centerY,
      );
      let px = point.x;
      let py = point.y;
      if (pointer.active) {
        const dx = px - pointer.x;
        const dy = py - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0 && distance < 125) {
          const force = (1 - distance / 125) ** 2 * 22;
          px += (dx / distance) * force;
          py += (dy / distance) * force;
        }
      }
      for (const pulse of pulses) {
        const dx = px - pulse.x;
        const dy = py - pulse.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const ringDistance = Math.abs(distance - pulse.age * 310);
        if (ringDistance < 65) {
          const force = (1 - ringDistance / 65) * 20 * (1 - pulse.age / 1.8);
          px += (dx / distance) * force;
          py += (dy / distance) * force;
        }
      }
      const depthAlpha = Math.max(
        0.2,
        Math.min(0.9, (0.95 - point.z * 0.36) * (0.55 + particle.w * 0.4)),
      );
      const color =
        particle.color === "cyan"
          ? "132,219,211"
          : particle.color === "white"
            ? "225,245,202"
            : "180,224,114";
      context.fillStyle = `rgba(${color},${depthAlpha})`;
      const size = particle.size * point.perspective;
      context.fillRect(px, py, size, size);
      if (particle.w > 0.987) {
        context.fillStyle = `rgba(${color},${depthAlpha * 0.08})`;
        context.beginPath();
        context.arc(px, py, size * 4, 0, fullCircle);
        context.fill();
      }
    }
    for (const pulse of pulses) {
      context.strokeStyle = `rgba(196,248,106,${Math.max(0, 0.32 * (1 - pulse.age / 1.8))})`;
      context.lineWidth = 0.8;
      context.beginPath();
      context.arc(pulse.x, pulse.y, pulse.age * 310, 0, fullCircle);
      context.stroke();
    }
    context.globalCompositeOperation = "source-over";
  }

  /** 页面隐藏、首屏滚出或手动暂停时不申请下一帧，避免无效渲染占用资源。 */
  function canAnimate() {
    return (
      Boolean(context) && !state.paused && !document.hidden && state.inView
    );
  }

  function animate(timestamp) {
    state.frame = 0;
    if (!canAnimate()) return;
    // 限制动画到约 60 帧，避免高刷新率设备消耗多余电量。
    if (state.previousTime && timestamp - state.previousTime < 15) {
      state.frame = requestAnimationFrame(animate);
      return;
    }
    const delta = state.previousTime
      ? Math.min((timestamp - state.previousTime) / 1000, 0.05)
      : 1 / 60;
    state.previousTime = timestamp;
    state.time += delta;
    for (const pulse of pulses) pulse.age += delta;
    pulses = pulses.filter((pulse) => pulse.age < 1.8);
    setParticlePositions();
    drawScene();
    state.frameCount++;
    if (timestamp - state.lastFpsTime > 1000) {
      state.fps = Math.round(
        (state.frameCount * 1000) / (timestamp - state.lastFpsTime),
      );
      fpsValue.textContent = String(state.fps);
      state.frameCount = 0;
      state.lastFpsTime = timestamp;
    }
    state.frame = requestAnimationFrame(animate);
  }

  function syncAnimation() {
    if (state.frame) cancelAnimationFrame(state.frame);
    state.frame = 0;
    state.previousTime = 0;
    state.lastFpsTime = performance.now();
    state.frameCount = 0;
    if (canAnimate()) state.frame = requestAnimationFrame(animate);
    else fpsValue.textContent = "—";
  }

  /** 手动选择优先于系统初始偏好，暂停状态同时覆盖 Canvas 和 CSS 动画。 */
  function setPaused(paused) {
    state.paused = paused;
    document.body.classList.toggle("motion-paused", paused);
    motionButton.setAttribute("aria-pressed", String(paused));
    motionButton.setAttribute("aria-label", paused ? "播放动画" : "暂停动画");
    motionButton.querySelector("span").textContent = paused ? "▷" : "Ⅱ";
    syncAnimation();
  }

  function selectMode(mode) {
    state.mode = mode;
    modeButtons.forEach((button) => {
      const selected = button.dataset.mode === mode;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    document.querySelector("#formation-label").textContent = {
      orbit: "ORBITAL FIELD",
      galaxy: "SPIRAL GALAXY",
      sphere: "PARTICLE SPHERE",
    }[mode];
    // 暂停或减少动态效果时仍立即呈现新形态，保证控件始终有效。
    if (!canAnimate()) {
      setParticlePositions(true);
      drawScene();
    }
  }

  modeButtons.forEach((button) =>
    button.addEventListener("click", () => selectMode(button.dataset.mode)),
  );
  motionButton.addEventListener("click", () => setPaused(!state.paused));
  reducedMotion.addEventListener("change", (event) => setPaused(event.matches));
  document.addEventListener("visibilitychange", syncAnimation);
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 100);
  });
  hero.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch" || state.paused) return;
      const rect = hero.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    },
    { passive: true },
  );
  hero.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
  hero.addEventListener("click", (event) => {
    if (state.paused || event.target.closest("a, button")) return;
    const rect = hero.getBoundingClientRect();
    // 限制同时存在的脉冲数量，连续点击时也保持稳定的渲染成本。
    pulses.push({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      age: 0,
    });
    if (pulses.length > 4) pulses.shift();
  });

  document.querySelector("#year").textContent = String(
    new Date().getFullYear(),
  );
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(".reveal")
      .forEach((element) => revealObserver.observe(element));
    document.documentElement.classList.add("js");

    new IntersectionObserver((entries) => {
      state.inView = entries[0].isIntersecting;
      syncAnimation();
    }).observe(hero);

    const sections = [...document.querySelectorAll("main > section[id]")];
    const links = [...document.querySelectorAll(".nav-link")];
    // 根据滚动位置选择当前章节，避免高矮不一的章节同时进入视口时高亮抖动。
    let navigationPending = false;
    const updateNavigation = () => {
      let activeId = "home";
      const trigger = window.innerHeight * 0.4;
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= trigger)
          activeId = section.id;
      });
      links.forEach((link) => {
        const active = link.hash === `#${activeId}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      navigationPending = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!navigationPending) {
          navigationPending = true;
          requestAnimationFrame(updateNavigation);
        }
      },
      { passive: true },
    );
    updateNavigation();
  }

  // 浏览器不支持 Canvas 时保留文字、导航与外链，不让装饰功能阻断访问。
  if (!context) {
    modeButtons.forEach((button) => {
      button.disabled = true;
    });
    motionButton.disabled = true;
    document.querySelector(".interaction-hint").textContent =
      "探索代码与系统的更多可能";
    return;
  }
  resizeCanvas();
  setPaused(state.paused);
})();
