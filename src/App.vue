<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WebViews from './components/webviews.vue'
import WebSiteList from './components/websitelist.vue'
import { ipcRenderer } from 'electron'
import { setWebsiteConfigs, setAllWebsiteConfigs, getWebsiteConfigs, getAllWebsiteConfigs } from './types/website'
import { Button } from 'ant-design-vue'
import { UpOutlined, DownOutlined, SendOutlined } from '@ant-design/icons-vue'
// import ChatComponent from './components/ChatComponent.vue'

const message = ref('')
const webViewsRef = ref<InstanceType<typeof WebViews> | null>(null)
const isSidebarOpen = ref(false)
const isInputCollapsed = ref(false)


const sendMessage = async (msg?: string) => {
  const text = msg || message.value
  if (!msg) message.value = ''
  if (text.trim()) {
    // 调用子组件的sendMessage方法
    if (webViewsRef.value) {
      webViewsRef.value.sendMessage(text)
    }
  }
}

const optimizeMessage = async () => {
  if (message.value.trim()) {
    try {
      const optimizedText = await ipcRenderer.invoke('optimize-prompt', message.value)
      message.value = optimizedText
    } catch (error) {
      console.error('Failed to optimize prompt:', error)
      // 可以添加用户提示，但暂时用 console
    }
  }
}

onMounted(async () => {
  // 监听来自主进程的消息，用于跨窗口调用
  ipcRenderer.on('trigger-send-message', (_, msg) => {
    sendMessage(msg)
  })

  // 加载websiteConfigs和allWebsiteConfigs
  const loadedWebsiteConfigs = await ipcRenderer.invoke('load-website-configs')
  const loadedAllWebsiteConfigs = await ipcRenderer.invoke('load-all-website-configs')

  // 设置配置，如果没有加载到则使用默认值
  setWebsiteConfigs(loadedWebsiteConfigs)
  setAllWebsiteConfigs(loadedAllWebsiteConfigs)

  // 监听应用退出事件，保存激活websites和配置
  ipcRenderer.on('app-quitting', () => {
    // console.log('saving website configs:', getWebsiteConfigs())
    // console.log('saving all website configs:', getAllWebsiteConfigs())
    ipcRenderer.invoke('save-website-configs', getWebsiteConfigs())
    ipcRenderer.invoke('save-all-website-configs', getAllWebsiteConfigs())
  })
})

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const toggleInput = () => {
  isInputCollapsed.value = !isInputCollapsed.value
}

const handleSelectWebsite = (url: string) => {
  // 当侧边栏选中网站时，滚动到对应的webview位置
  if (webViewsRef.value) {
    webViewsRef.value.scrollToWebsite(url)
  }
}
</script>

<template>
  <div class="app">
    <WebSiteList :collapsed="!isSidebarOpen" @toggle-sidebar="toggleSidebar" @select-website="handleSelectWebsite" class="websiteList"></WebSiteList>
    <div class="interact-area">
      <!-- <ChatComponent></ChatComponent> -->
      <WebViews ref="webViewsRef" class="webviews"></WebViews>
      <div class="input-container" :class="{ collapsed: isInputCollapsed }">
        <div class="textarea-wrapper">
          <textarea
            v-model="message"
            @keydown.enter.exact.prevent="() => sendMessage()"
            placeholder="How can I help you today?"
            rows="3"
          ></textarea>
          <Button
            class="optimize-button"
            @click="optimizeMessage"
          >
            optimize
          </Button>
          <Button
            class="send-button"
            shape="circle"
            @click="() => sendMessage()"
          >
            <template #icon>
              <SendOutlined />
            </template>
          </Button>
        </div>
        <Button
          class="input-toggle"
          shape="circle"
          :aria-label="isInputCollapsed ? 'Expand input' : 'Collapse input'"
          @click="toggleInput"
        >
          <template #icon>
            <UpOutlined v-if="isInputCollapsed" />
            <DownOutlined v-else />
          </template>
        </Button>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #faf9f6;
}
.websiteList {
  width: 15wh;
}
.interact-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  width: 70%;
}
.webviews {
  flex: 1;
  overflow-x: auto;
  min-height: 0; /* 允许flex子项缩小 */
}

/* 自定义水平滚动条样式 */
.webviews::-webkit-scrollbar {
  height: 10px;
}

.webviews::-webkit-scrollbar-track {
  background: rgba(250, 249, 246, 0.8);
  border-radius: 10px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.webviews::-webkit-scrollbar-thumb {
  background: #4d4d4d;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.webviews::-webkit-scrollbar-thumb:hover {
  background: #5a67d8;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transform: scaleY(1.1);
}

.webviews::-webkit-scrollbar-thumb:active {
  background: linear-gradient(135deg, #4c51bf 0%, #553c9a 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}
.input-container {
  height: 120px;
  display: flex;
  padding: 0px 15px 0px 15px;
  background-color: #faf9f6;
  border-top: 1px solid #e5e7eb;
  align-items: center;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  position: relative;
}

.textarea-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
}

.input-container textarea {
  width: 100%;
  padding: 14px 120px 14px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: #ffffff;
  color: #1a1a1a;
  font-size: 15px;
  font-family: inherit;
  line-height: 1.5;
  outline: none;
  transition: all 0.2s ease;
  resize: none;
  min-height: 60px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.input-container textarea::placeholder {
  color: #9ca3af;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.input-container textarea:focus {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.optimize-button {
  position: absolute;
  bottom: 14px;
  right: 78px;
  width: 64px;
  height: 36px;
  border: 2px solid #000dff !important;
  background: #000000 !important;
  color: #ffffff !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 13px;
  border-radius: 20px;
}

.optimize-button:hover {
  border-color: #1a23c4 !important;
  background: #1a23c0 !important;
  color: #ffffff !important;
}

.optimize-button:active {
  background: #372be2 !important;
}

.send-button {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 40px;
  height:40px;
  border: 2px solid #000000 !important;
  background: #000000 !important;
  color: #ffffff !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.send-button:hover {
  border-color: #000000 !important;
  background: #333333 !important;
  color: #ffffff !important;
}

.send-button:active {
  background: #1a1a1a !important;
}

.input-toggle {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border: 2px solid #000000 !important;
  background: #ffffff !important;
  color: #000000 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  z-index: 200;
  box-shadow: none !important;
}

.input-toggle:hover {
  border-color: #000000 !important;
  background: #f5f5f5 !important;
  color: #000000 !important;
}

.input-toggle:active {
  background: #e8e8e8 !important;
}



.input-container.collapsed {
  height: 20px;
  overflow: visible;
  transition: height 0.2s ease;
}

.input-container.collapsed .textarea-wrapper,
.input-container.collapsed .send-button,
.input-container.collapsed .optimize-button {
  display: none;
}

.input-container.collapsed .input-toggle {
  top: -40px;
  z-index: 300;
}
</style>
