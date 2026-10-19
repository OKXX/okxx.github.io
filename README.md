# OKXX · Personal Universe

以 OKXX 个人账号为中心的静态主页，使用原生 HTML、CSS、JavaScript 与 Canvas 2D。无需安装依赖、运行构建或配置后端。

## 页面与交互

- Canvas 三维粒子场：轨道、星云、球体，切换时平滑变形。
- 鼠标视差与粒子扰动、点击扩散脉冲、轨道刻度、呼吸星点。
- 滚动入场、技术栈滚动带、CSS 轨道动画、终端光标。
- 暂停按钮、系统减少动态效果偏好、屏幕外及后台暂停渲染。
- 桌面与移动布局、键盘焦点、语义化导航、无 JavaScript 内容降级。

个人信息依据 [OKXX 的 GitHub 公开资料](https://github.com/OKXX)整理，没有使用实时 API 或虚构项目数据。

## 本地预览

可以直接打开 `index.html`，也可以在项目根目录启动静态服务器：

```sh
python -m http.server 4173 --bind 127.0.0.1
```

访问 <http://127.0.0.1:4173>。

## 发布到 GitHub Pages

将本项目文件提交并推送到 `OKXX/okxx.github.io` 的 `master` 分支。在 GitHub 仓库的 **Settings → Pages → Build and deployment** 中，选择：

- Source：**Deploy from a branch**
- Branch：**master**，目录：**/ (root)**

保存并等待 GitHub Pages 部署完成，然后访问 <https://okxx.github.io/>。

发布源设置详见 [GitHub Pages 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

根目录的 `.nojekyll` 让 GitHub Pages 直接发布静态文件；资源采用相对路径，无需额外构建配置。GitHub 仓库链接用于查看源码，真正的网站地址是 `https://okxx.github.io/`。

## 自定义

- `index.html`：个人简介、技术栈、GitHub 链接及页面文案。
- `styles.css`：配色、布局、字体与 CSS 动画。
- `app.js`：粒子数量、形态、交互与动画生命周期。
- `assets/favicon.svg`：网站图标。

Barlow Condensed、IBM Plex Mono 与 Noto Sans SC 字体均保存在 `assets/fonts/`，并附带各自的 OFL 许可。中文字体只保留页面所需的字符以缩小体积；修改中文文案时，未包含的字符会自动使用本地备用字体。所有运行资源均来自当前仓库，页面无需访问外部字体服务、API 或动画库。
