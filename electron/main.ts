import { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, dialog, shell } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
// import { autoUpdater } from 'electron-updater';
import path from 'node:path'
import Store from 'electron-store'
import type { UpdateInfo } from 'electron-updater'
// import LLMConversation from './llm_conversation.ts'
// import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
// import { WebsiteData } from './website_data.ts'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 导入electron-updater
const { autoUpdater } = require('electron-updater')

// 初始化electron-store
const store = new Store()

// 安全的日志函数，避免在打包后的应用中产生EPIPE错误
function safeLog(...args: any[]) {
  try {
    // 只在开发环境中使用console.log，打包后的应用可能没有stdout
    if (!app.isPackaged) {
      console.log(...args)
    }
  } catch (error) {
    // 忽略EPIPE等错误
  }
}

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let tray: Tray | null
let isQuitting = false  // 退出标志，用于区分关闭窗口和退出应用

function createBlankWindow() {
  const smallWin = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.ico'),
    width: 600,
    height: 220,
    // frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    smallWin.loadURL(`${VITE_DEV_SERVER_URL}/smallwin.html`)
  } else {
    smallWin.loadFile(path.join(RENDERER_DIST, 'smallwin.html'))
  }
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.ico'),
    // minHeight: 800,
    // minWidth: 1000,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
    },
  })

  // win.maximize()
  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
    // 发送加载激活websites的事件
    win?.webContents.send('load-active-websites')
    // 打开开发者工具查看renderer console
    // if (VITE_DEV_SERVER_URL) {
    //   win?.webContents.openDevTools({ mode: 'detach' })
    // }
  })
  // 监听renderer进程的控制台消息
  win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    safeLog(`[RENDERER CONSOLE] ${level}: ${message} (${sourceId}:${line})`)
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.on('close', (event) => {
    // 如果真的要退出，允许关闭
    if (isQuitting) {
      if (tray) tray.destroy()
      return
    }
    // 否则阻止默认的关闭行为，隐藏窗口
    event.preventDefault()
    if (win) win.hide()
  })

  // 创建托盘图标，使用回退方式
  const trayIconPath = require('fs').existsSync(path.join(process.env.VITE_PUBLIC, 'icon.ico'))
    ? path.join(process.env.VITE_PUBLIC, 'icon.ico')
    : require('fs').existsSync(path.join(process.env.VITE_PUBLIC, 'icon.png'))
    ? path.join(process.env.VITE_PUBLIC, 'icon.png')
    : path.join(process.env.VITE_PUBLIC, 'electron-vite.svg')
  tray = new Tray(trayIconPath)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Window',
      click: () => {
        if (win) win.show()
      }
    },
    {
      label: 'exit',
      click: () => {
        isQuitting = true  // 设置退出标志
        if (win) {
          win.webContents.send('app-quitting')
          // 给渲染进程一点时间保存数据
          setTimeout(() => {
            if (tray) tray.destroy()
            app.quit()
          }, 100)
        } else {
          if (tray) tray.destroy()
          app.quit()
        }
      }
    }
  ])
  tray.setToolTip('PolyQuery')
  tray.setContextMenu(contextMenu)
}

// 当所有窗口关闭时，不退出应用，因为托盘仍然存在
// 用户需要通过托盘菜单选择退出
app.on('window-all-closed', () => {
  // 不做任何事，让托盘保持运行
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win && !win.isVisible()) {
    win.show()
  } else if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
    setupAutoUpdater()
  }
})

let gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
  process.exit(0)
}

// 设置应用名称
app.setName('PolyQuery')

app.on('second-instance', () => {
  // 当尝试启动第二个实例时，显示主窗口
  if (win) {
    win.show()
    win.focus()
  }
})

// 应用启动后创建窗口并注册快捷键
app.whenReady().then(() => {
  createWindow()
  setupAutoUpdater()
  // 注册全局快捷键来打开空白窗口
  const ret = globalShortcut.register('CommandOrControl+Shift+Space', () => {
    createBlankWindow()
  })
  if (!ret) {
    safeLog('快捷键注册失败')
  }

  // 监听来自Smallwin的发送消息请求，转发到主窗口
  ipcMain.on('send-message-to-main-window', (_event, message) => {
    if (win) {
      if (win) win.show()
      win.webContents.send('trigger-send-message', message)
    }
  })

  // 保存websiteConfigs
  ipcMain.handle('save-website-configs', async (_event, configs) => {
    safeLog('save-website-configs', configs)
    store.set('websiteConfigs', configs)
  })
  // 加载websiteConfigs
  ipcMain.handle('load-website-configs', async () => {
    safeLog('load-website-configs', store.get('websiteConfigs', null))
    return store.get('websiteConfigs', null)
  })

  // 保存allWebsiteConfigs
  ipcMain.handle('save-all-website-configs', async (_event, configs) => {
    safeLog('save-all-website-configs', configs)
    store.set('allWebsiteConfigs', configs)
    // store.set('allWebsiteData', WebsiteData)
  })
  // 加载allWebsiteConfigs
  ipcMain.handle('load-all-website-configs', async () => {
    safeLog('load-all-website-configs', store.get('allWebsiteConfigs', null))
    // const loadedData = store.get('allWebsiteData', null)
    // if (Array.isArray(loadedData)) {
    //   WebsiteData.length = 0
    //   WebsiteData.push(...loadedData)
    // }
    return store.get('allWebsiteConfigs', null)
  })
})

// 监听应用退出前的事件（Dock Quit会触发这个）
app.on('before-quit', (_event) => {
  isQuitting = true
  // 通知渲染进程保存数据
  if (win && !win.isDestroyed()) {
    win.webContents.send('app-quitting')
    // 给渲染进程一点时间保存数据
    setTimeout(() => {
      // 不阻止退出，让应用正常退出
    }, 100)
  }
})

// 应用退出前取消注册快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

function setupAutoUpdater() {
  // 开启日志（可选，方便调试）
  try {
    autoUpdater.logger = require('electron-log');
    if (autoUpdater.logger) {
      (autoUpdater.logger as any).transports.file.level = 'info';
    }
  } catch (error) {
    console.warn('electron-log not available, using console for logging');
    autoUpdater.logger = console;
  }

  // 禁用自动下载，让用户手动选择
  autoUpdater.autoDownload = false;

  // 检测更新（应用启动后立即检测）
  autoUpdater.checkForUpdates();

  // 3. 监听更新事件
  // 事件1：发现新版本
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    if (win){
      dialog.showMessageBox(win, {
        type: 'info',
        title: '发现新版本',
        message: `当前版本：${app.getVersion()}，最新版本：${info.version}`,
        detail: Array.isArray(info.releaseNotes) ? info.releaseNotes.join('\n') : info.releaseNotes || '修复已知问题，优化用户体验',
        buttons: ['立即下载', '稍后']
      }).then((result) => {
        if (result.response === 0) { // 用户点击“立即下载”
          // autoUpdater.downloadUpdate(); // 开始下载更新包
          shell.openExternal(`https://github.com/shenlan-ai/PolyQuery/releases/tag/${info.version}`);
        }
      });
    }
  });

  // 事件2：无新版本
  autoUpdater.on('update-not-available', () => {
    // dialog.showMessageBox(mainWindow, {
    //   type: 'info',
    //   title: '已是最新版本',
    //   message: '当前应用为最新版本，无需更新'
    // });
  });

  // 事件3：更新下载完成
  autoUpdater.on('update-downloaded', (_info: UpdateInfo) => {
    if (win) {
      dialog.showMessageBox(win, {
        type: 'info',
        title: '更新下载完成',
        message: '更新包已下载完成，是否立即重启应用生效？',
        buttons: ['立即重启', '稍后重启']
      }).then((result) => {
        if (result.response === 0) { // 用户点击“立即重启”
          autoUpdater.quitAndInstall(); // 退出并安装更新
        }
      });
    }
  });

  // 事件4：更新失败
  autoUpdater.on('error', (err: Error) => {
    // 构建详细的错误信息
    let errorMessage = '更新出错：';
    let errorDetail = '';
    if (err) {
      // 显示错误消息
      errorMessage += err.message || '未知错误';
      // 构建详细错误信息
      const errorDetails: string[] = [];
      // 添加错误名称
      if (err.name && err.name !== 'Error') {
        errorDetails.push(`错误类型: ${err.name}`);
      }
      // 添加错误代码（如果有）
      if ((err as any).code) {
        errorDetails.push(`错误代码: ${(err as any).code}`);
      }
      // 添加 HTTP 状态码（如果有）
      if ((err as any).statusCode) {
        errorDetails.push(`HTTP状态码: ${(err as any).statusCode}`);
      }
      // 添加堆栈跟踪（仅在开发环境）
      if (!app.isPackaged && err.stack) {
        const stackLines = err.stack.split('\n').slice(1, 4); // 只显示前3行堆栈
        errorDetails.push(`堆栈跟踪:\n${stackLines.join('\n')}`);
      }
      // 添加网络相关信息
      if ((err as any).hostname) {
        errorDetails.push(`主机: ${(err as any).hostname}`);
      }
      errorDetail = errorDetails.join('\n\n');
      // 如果没有详细错误信息，提供通用建议
      if (!errorDetail) {
        errorDetail = '请检查以下可能的原因：\n' +
                     '• 网络连接问题\n' +
                     '• GitHub 服务不可用\n' +
                     '• 应用权限不足\n' +
                     '• 磁盘空间不足\n\n' +
                     '建议稍后重试，或联系技术支持。';
      }
    } else {
      errorMessage += '未知错误';
      errorDetail = '发生了未知错误，请稍后重试。';
    }
    // 记录到日志
    console.error('Auto-updater error:', err);
    // 显示错误对话框
    if (win) {
      dialog.showMessageBox(win, {
        type: 'error',
        title: '更新失败',
        message: errorMessage,
        detail: errorDetail+"\n\n"+errorMessage
      });
    }
  });
}
