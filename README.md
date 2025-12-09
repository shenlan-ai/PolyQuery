# PolyQuery

<div align="right">
  <a href="README_EN.md">English</a> | <b>中文</b>
</div>

<p align="center">
  <img src="public/icon.ico" alt="PolyQuery Logo" width="128" height="128">
</p>

<p align="center">
  <img alt="GitHub release" src="https://img.shields.io/github/release/shenlan-ai/PolyQuery.svg">
  <img alt="License" src="https://img.shields.io/github/license/shenlan-ai/PolyQuery.svg">
  <img alt="Platform" src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg">
</p>

## PolyQuery可以用来做什么？

- **同时和多个AI聊天**: 你可以同时在多个AI平台上进行对话和比较，从而更全面地了解信息并感受模型的好坏。
- **便捷输入**: 你可以通过PolyQuery的功能快速向多个网站发送消息，只需输入关键字即可。
<video width="100%" controls>
  <source src="https://raw.githubusercontent.com/shenlan-ai/PolyQuery/main/public/%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E.mp4" type="video/mp4">
  您的浏览器不支持视频标签。
</video>

## 功能特性

### 🎯 免费
- **无广告**: 完全开源，没有广告
- **免费**: 无需任何付费，所有功能均免费，同时和多个模型对话也是基于模型官网，无需使用api。

### 🌈 易于部署
- **跨平台**: 支持Windows、macOS、Linux平台，无需额外安装
- **开箱即用**: 无需配置，直接通过安装包安装，运行即可使用

### 🚀 高效工作流
- **一键多发**: 在多个网站同时发送相同问题
- **并行比较**: 同时查看多个网站的结果，便于比较效果
- **快捷输入**: 支持全局快捷键 Ctrl+Shift+space 打开小窗口快速输入

### 🔧 灵活配置
- **自定义网站**: 可以自由地拓展网站列表
- **网站管理**: 支持对网站的添加、删除、排序、分类管理
- **拖拽排序**: 支持拖拽重新排列网站顺序
- **配置持久化**: 自动保存用户配置和偏好设置

### 💻 桌面体验
- 基于Electron的原生桌面应用
- 系统托盘支持，最小化到托盘运行
- 自动更新功能
- 跨平台支持 (Windows/macOS/Linux)

### 基本操作介绍
1. **启动应用**: 运行 `npm run start` 或直接运行安装好的应用
2. **添加AI网站**: 点击侧边栏的 "+" 按钮添加新的AI平台
3. **激活网站**: 双击网站列表中的项目来添加/移除活跃网站
4. **发送消息**: 在底部输入框输入问题，按回车或点击发送按钮将信息同步发送到所有激活的网站
5. **切换侧边栏**: 点击左上角的 "<" 或 ">" 按钮折叠/展开侧边栏
6. **快速输入**: 按 Ctrl+Shift+space 打开小输入窗口
7. **切换输入框**: 点击下方的 ">" 按钮折叠/展开文本输入框
8. **最大化网页**: 点击网页右上角的 "⛶" 按钮最大化网页

### 功能介绍视频

1. B站：
[PolyQuery 中文功能介绍](https://www.bilibili.com/video/BV1zK4y1a7yT/) 
[PolyQuery 英文功能介绍](https://www.bilibili.com/video/BV17K4y1a7yT/)
2. X.com：
[PolyQuery 中文功能介绍](https://www.ixigua.com/6939022890992222215/) 
[PolyQuery 英文功能介绍](https://www.ixigua.com/6939022890992222215/)

## 安装

### 下载安装包

下载最新版安装包并安装：

- [Windows](https://github.com/shenlan-ai/PolyQuery/releases/tag/1.0.0/PolyQuery-Windows-1.0.0-Installer.exe)
- [macOS](https://github.com/shenlan-ai/PolyQuery/releases/tag/1.0.0/PolyQuery-Mac-1.0.0-Installer.dmg)
- [Linux](https://github.com/shenlan-ai/PolyQuery/releases/tag/1.0.0/PolyQuery-Linux-1.0.0-Installer.AppImage)

### 从源代码构建

#### 系统要求
- Node.js 16+
- npm 或 yarn 或 pnpm

#### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/shenlan-ai/PolyQuery.git
cd polyquery
```
2. **安装依赖**
```bash
npm install
```
3. **开发模式运行**
```bash
npm run dev
```
4. **构建应用**
```bash
# 构建并打包
npm run build
# 仅构建不打包
npm run build:electron
# 平台特定构建
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```


## 项目架构

### 技术栈
- **前端**: Vue 3 + TypeScript + Vite
- **桌面**: Electron + Electron Forge
- **构建**: Vite + Rollup
- **样式**: Vue scoped CSS + 自定义设计系统

### 项目结构
```
PolyQuery/
├── electron/               # Electron 主进程相关代码
│   ├── config.ts           # 应用配置管理
│   ├── electron-env.d.ts   # Electron 类型定义
│   ├── llm_conversation.ts # LLM 对话处理逻辑
│   ├── main.ts             # Electron 主进程入口
│   ├── preload.ts          # 预加载脚本，暴露安全API
│   ├── prompt_optimizer.ts # 提示词优化器
│   └── website_data.ts     # 网站数据和配置
├── src/                    # Vue 应用源代码
│   ├── assets/             # 静态资源文件
│   │   └── sendIcon.svg    # 发送图标
│   ├── components/         # Vue 组件
│   │   ├── webviews.vue    # WebView 容器组件
│   │   └── websitelist.vue # 网站列表组件
│   ├── types/              # TypeScript 类型定义
│   │   └── website.ts      # 网站配置类型
│   ├── App.vue             # 主应用组件
│   ├── main.ts             # Vue 应用入口
│   ├── smallwin.ts         # 小窗口逻辑
│   ├── Smallwin.vue        # 小窗口组件
│   ├── style.css           # 全局样式
│   └── vite-env.d.ts       # Vite 环境类型定义
├── public/                 # 公共静态资源
│   ├── icon.icns           # macOS 应用图标
│   └── icon.ico            # Windows 应用图标
├── pictures_in_README/     # README 中使用的图片资源
├── .gitignore              # Git 忽略文件配置
├── dev-app-update.yml      # 开发环境自动更新配置
├── electron-builder.yml    # Electron Builder 配置
├── forge.config.cjs        # Electron Forge 配置
├── index.html              # 主页面 HTML 模板
├── js.md                   # JavaScript 相关文档
├── package.json            # 项目依赖和脚本配置
├── package-lock.json       # 锁定依赖版本
├── README.md               # 项目说明文档
├── smallwin.html           # 小窗口 HTML 模板
├── tsconfig.json           # TypeScript 配置
├── tsconfig.node.json      # Node.js TypeScript 配置
└── vite.config.ts          # Vite 构建配置
```

### 核心功能实现

#### 多WebView管理
- 使用Electron的 `<webview>` 标签嵌入多个网站
- 每个WebView独立运行，支持不同的JavaScript环境
- 自动注入脚本实现跨域输入和发送

#### 智能选择器系统
- 为每个AI平台定义特定的CSS选择器
- 支持多种输入框类型：textarea、input、contenteditable div

#### 配置管理系统
- 使用electron-store实现本地配置存储
- 支持网站列表、活跃网站、用户偏好等配置
- 应用退出时自动保存，启动时自动恢复

## 开发指南

### 开发环境设置

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```

3. **启动Electron应用**
```bash
npm run start
```

### 构建和发布

```bash
# 启动应用（开发模式）
npm run start

# 创建未打包的应用目录
npm run package

# 创建分发版本
npm run make

# 仅构建不打包
npm run build:electron

# 生产打包
npm run build

# 创建未打包目录（electron-builder）
npm run build:unpack

# 发布到不同平台
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## 常见问题

### Q: 为什么有些网站无法正常工作？
A: 不同网站可能更改了DOM结构，导致选择器失效。请检查网站是否更新，并相应调整文本输入框选择器。

### Q: 如何添加更多的网站？
A: 使用侧边栏的"+"按钮添加自定义网站，需要提供正确的URL和CSS选择器。

### Q: 如何备份我的配置？
A: 配置文件存储在用户数据目录中，可以手动复制electron-store的存储文件。

## 后续开发计划

- [ ] 开发自主编写脚本功能
- [ ] 通过爬虫让网站中的AI能支持外部的MCP
- [ ] 增加文件上传脚本
- [ ] 基于爬虫实现命令行版本的PolyQuery

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 致谢

- [Electron](https://electronjs.org/) - 桌面应用框架
- [Vue.js](https://vuejs.org/) - 前端框架
- [Vite](https://vitejs.dev/) - 构建工具
- 所有支持的AI平台提供商

## 👥 贡献者

感谢以下优秀的贡献者们：

- [yaolan](https://github.com/lgylgy1)
- [Xu Ziqi](https://github.com/mersault18)


<!-- ## 📈 项目统计

<a href="https://www.star-history.com/#shenlan-ai/PolyQuery&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=shenlan-ai/PolyQuery&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=shenlan-ai/PolyQuery&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=shenlan-ai/PolyQuery&type=date&legend=top-left" />
 </picture>
</a>

![Alt](https://repobeats.axiom.co/api/embed/e04e3eea4674edc39c148a7845c8d09c1b7b1922.svg "Repobeats analytics image") -->

---

## ⚠️ 免责声明

**重要提醒：本项目仅供学习、学术研究和教育目的使用**

1. **合规性声明**：
   - 本项目中的所有代码、工具和功能均仅供学习、学术研究和教育目的使用
   - 严禁将本项目用于任何商业用途或盈利性活动
   - 严禁将本项目用于任何违法、违规或侵犯他人权益的行为

2. **技术免责**：
   - 作者不对使用本项目造成的任何直接或间接损失承担责任
   - 使用者应自行评估项目的适用性和风险

3. **责任限制**：
   - 使用者在使用本项目前应充分了解相关法律法规
   - 使用者应确保其使用行为符合当地法律法规要求
   - 因违反法律法规使用本项目而产生的任何后果由使用者自行承担

**请在使用本项目前仔细阅读并理解上述免责声明。使用本项目即表示您已同意并接受上述所有条款。**
