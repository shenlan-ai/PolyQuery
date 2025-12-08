# PolyQuery

<div align="right">
  <a href="README.md">中文</a> | <b>English</b>
</div>

<p align="center">
  <img src="public/icon.ico" alt="PolyQuery Logo" width="128" height="128">
</p>

<p align="center">
  This is not only a free, web-based multi-AI chat desktop client that supports simultaneous conversations and comparisons across multiple AI platforms; it is also a quick search tool that helps you break through information cocoons and quickly obtain sufficient information.
</p>

<p align="center">
  <img alt="GitHub release" src="https://img.shields.io/github/release/shenlan-ai/PolyQuery.svg">
  <img alt="License" src="https://img.shields.io/github/license/shenlan-ai/PolyQuery.svg">
  <img alt="Platform" src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg">
</p>

## What can PolyQuery be used for?

- **Chat with multiple AIs simultaneously**: You can converse and compare on multiple AI platforms at the same time, gaining a comprehensive understanding of information and experiencing the strengths and weaknesses of models.
- **Convenient input**: You can quickly send messages to multiple websites through PolyQuery's functionality, just enter keywords.

## Basic Usage Video

<video width="100%" controls>
  <source src="public/基本使用说明.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Features

### 🎯 Free
- **No ads**: Completely open source, no ads
- **Free**: No payment required, all features are free, simultaneous conversations with multiple models are based on official websites, no API required.

### 🌈 Easy to deploy
- **Cross-platform**: Supports Windows, macOS, Linux platforms, no additional installation required
- **Out of the box**: No configuration required, install directly via installer and run

### 🚀 Efficient workflow
- **One-click multi-send**: Send the same question to multiple websites simultaneously
- **Parallel comparison**: View results from multiple websites simultaneously for easy comparison
- **Quick input**: Supports global shortcut Ctrl+Shift+space to open small window for quick input

### 🔧 Flexible configuration
- **Custom websites**: Freely expand the website list
- **Website management**: Supports adding, deleting, sorting, categorizing websites
- **Drag-and-drop sorting**: Supports drag-and-drop to rearrange website order
- **Configuration persistence**: Automatically saves user configuration and preferences

### 💻 Desktop experience
- Native desktop application based on Electron
- System tray support, minimize to tray
- Auto-update functionality
- Cross-platform support (Windows/macOS/Linux)

### Basic operation introduction
1. **Launch app**: Run `npm run start` or run the installed app directly
2. **Add AI website**: Click the "+" button in the sidebar to add a new AI platform
3. **Activate website**: Double-click items in the website list to add/remove active websites
4. **Send message**: Enter questions in the bottom input box, press Enter or click send button to sync to all active websites
5. **Toggle sidebar**: Click the "<" or ">" button in the top left to collapse/expand sidebar
6. **Quick input**: Press Ctrl+Shift+space to open small input window
7. **Toggle input box**: Click the ">" button below to collapse/expand text input box
8. **Maximize webpage**: Click the "⛶" button in the top right of the webpage to maximize

### Feature introduction videos

1. Bilibili:
[PolyQuery Chinese introduction](https://www.bilibili.com/video/BV1zK4y1a7yT/)
[PolyQuery English introduction](https://www.bilibili.com/video/BV17K4y1a7yT/)
2. X.com:
[PolyQuery Chinese introduction](https://www.ixigua.com/6939022890992222215/)
[PolyQuery English introduction](https://www.ixigua.com/6939022890992222215/)

## Installation

### Download installer

Download the latest installer and install:

- [Windows](https://github.com/shenlan-ai/PolyQuery/releases/tag/1.0.0/PolyQuery-Windows-1.0.0-Installer.exe)
- [macOS](https://github.com/shenlan-ai/PolyQuery/releases/tag/1.0.0/PolyQuery-Mac-1.0.0-Installer.dmg)
- [Linux](https://github.com/shenlan-ai/PolyQuery/releases/tag/1.0.0/PolyQuery-Linux-1.0.0-Installer.AppImage)

### Build from source

#### System requirements
- Node.js 16+
- npm or yarn or pnpm

#### Installation steps

1. **Clone project**
```bash
git clone https://github.com/shenlan-ai/PolyQuery.git
cd polyquery
```
2. **Install dependencies**
```bash
npm install
```
3. **Run in development mode**
```bash
npm run dev
```
4. **Build application**
```bash
# Build and package
npm run build
# Build only without packaging
npm run build:electron
# Platform-specific builds
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```


## Project architecture

### Tech stack
- **Frontend**: Vue 3 + TypeScript + Vite
- **Desktop**: Electron + Electron Forge
- **Build**: Vite + Rollup
- **Styling**: Vue scoped CSS + custom design system

### Project structure
```
PolyQuery/
├── electron/               # Electron main process code
│   ├── config.ts           # Application configuration management
│   ├── electron-env.d.ts   # Electron type definitions
│   ├── llm_conversation.ts # LLM conversation logic
│   ├── main.ts             # Electron main process entry
│   ├── preload.ts          # Preload script, exposes secure API
│   ├── prompt_optimizer.ts # Prompt optimizer
│   └── website_data.ts     # Website data and configuration
├── src/                    # Vue application source code
│   ├── assets/             # Static resources
│   │   └── sendIcon.svg    # Send icon
│   ├── components/         # Vue components
│   │   ├── webviews.vue    # WebView container component
│   │   └── websitelist.vue # Website list component
│   ├── types/              # TypeScript type definitions
│   │   └── website.ts      # Website configuration types
│   ├── App.vue             # Main application component
│   ├── main.ts             # Vue application entry
│   ├── smallwin.ts         # Small window logic
│   ├── Smallwin.vue        # Small window component
│   ├── style.css           # Global styles
│   └── vite-env.d.ts       # Vite environment type definitions
├── public/                 # Public static resources
│   ├── icon.icns           # macOS application icon
│   └── icon.ico            # Windows application icon
├── pictures_in_README/     # Image resources used in README
├── .gitignore              # Git ignore configuration
├── dev-app-update.yml      # Development auto-update config
├── electron-builder.yml    # Electron Builder config
├── forge.config.cjs        # Electron Forge config
├── index.html              # Main page HTML template
├── js.md                   # JavaScript documentation
├── package.json            # Project dependencies and scripts
├── package-lock.json       # Lock dependency versions
├── README.md               # Project documentation
├── smallwin.html           # Small window HTML template
├── tsconfig.json           # TypeScript config
├── tsconfig.node.json      # Node.js TypeScript config
└── vite.config.ts          # Vite build config
```

### Core implementation

#### Multi-WebView management
- Embed multiple websites using Electron's `<webview>` tag
- Each WebView runs independently, supporting different JavaScript environments
- Automatic script injection for cross-domain input and sending

#### Intelligent selector system
- Define specific CSS selectors for each AI platform
- Supports multiple input types: textarea, input, contenteditable div

#### Configuration management system
- Use electron-store for local configuration storage
- Supports website lists, active websites, user preferences, etc.
- Auto-save on exit, auto-restore on startup

## Development guide

### Development environment setup

1. **Install dependencies**
```bash
npm install
```

2. **Start development server**
```bash
npm run dev
```

3. **Start Electron app**
```bash
npm run start
```

### Build and release

```bash
# Start app (dev mode)
npm run start

# Create unpacked app directory
npm run package

# Create distributable version
npm run make

# Build only without packaging
npm run build:electron

# Production build
npm run build

# Create unpacked directory (electron-builder)
npm run build:unpack

# Publish to different platforms
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## FAQ

### Q: Why do some websites not work properly?
A: Different websites may change their DOM structure, causing selectors to fail. Please check if the website has been updated and adjust the text input selector accordingly.

### Q: How to add more websites?
A: Use the "+" button in the sidebar to add custom websites, you need to provide the correct URL and CSS selector.

### Q: How to backup my configuration?
A: Configuration files are stored in the user data directory, you can manually copy the electron-store storage files.

## Future development plans

- [ ] Develop self-written script functionality
- [ ] Enable AI on websites to support external MCP via crawlers
- [ ] Add file upload script
- [ ] Implement CLI version of PolyQuery based on crawlers

## Contribution guide

Welcome to submit Issues and Pull Requests!

## License

This project uses the MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- [Electron](https://electronjs.org/) - Desktop application framework
- [Vue.js](https://vuejs.org/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool
- All supported AI platform providers

## 👥 Contributors

Thanks to the following excellent contributors:

- [yaolan](https://github.com/lgylgy1)
- [Xu Ziqi](https://github.com/mersault18)


<!-- ## 📈 Project statistics

<a href="https://www.star-history.com/#shenlan-ai/PolyQuery&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=shenlan-ai/PolyQuery&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=shenlan-ai/PolyQuery&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=shenlan-ai/PolyQuery&type=date&legend=top-left" />
 </picture>
</a>

![Alt](https://repobeats.axiom.co/api/embed/e04e3eea4674edc39c148a7845c8d09c1b7b1922.svg "Repobeats analytics image") -->

---

## ⚠️ Disclaimer

**Important reminder: This project is for learning, academic research, and educational purposes only**

1. **Compliance statement**:
   - All code, tools, and functions in this project are for learning, academic research, and educational purposes only
   - Strictly prohibited for any commercial use or profit-making activities
   - Strictly prohibited for any illegal, irregular, or infringing behavior

2. **Technical disclaimer**:
   - The author is not responsible for any direct or indirect losses caused by using this project
   - Users should evaluate the applicability and risks of the project themselves

3. **Liability limitation**:
   - Users should fully understand relevant laws and regulations before using this project
   - Users should ensure their usage complies with local laws and regulations
   - Users bear all consequences of using this project in violation of laws and regulations

**Please read and understand the above disclaimer carefully before using this project. Using this project means you agree to and accept all the above terms.**
