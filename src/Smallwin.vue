<script setup lang="ts">
import { ref } from 'vue'
import { Button } from 'ant-design-vue'
import { SendOutlined } from '@ant-design/icons-vue'

const message = ref('')

const sendMessage = async () => {
  if (message.value.trim()) {
    // 发送消息到主进程，进而调用主窗口的WebViews实例
    (window as any).ipcRenderer.send('send-message-to-main-window', message.value)
    message.value = ''
  }
}

const optimizeMessage = async () => {
  if (message.value.trim()) {
    try {
      const settings = await (window as any).ipcRenderer.invoke('load-llm-settings')
      const optimizedText = await (window as any).ipcRenderer.invoke('optimize-prompt', {
        message: message.value,
        apiKey: settings?.apiKey || 'YOUR_API_KEY',
        baseUrl: settings?.baseUrl || 'https://api.poly.ruguoapp.com/v1/chatbot',
        model: settings?.model || 'default'
      })
      message.value = optimizedText
    } catch (error) {
      console.error('Failed to optimize prompt:', error)
    }
  }
}
</script>

<template>

    <div class="input-container">
      <!-- <div class="textarea-wrapper"> -->
        <textarea
          v-model="message"
          @keydown.enter.exact.prevent="sendMessage"
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
          @click="sendMessage"
        >
          <template #icon>
            <SendOutlined />
          </template>
        </Button>
      <!-- </div> -->
    </div>
</template>

<style scoped>
.window {
  height: 100%;
  width: 100%;
  background-color: #faf9f6;
}

.input-container {
  height: 100%;
  display: flex;
  width: 100%;
  background-color: #faf9f6;
  border-top: 1px solid #e5e7eb;
  align-items: center;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
}

.textarea-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  align-items: center;
}

.input-container textarea {
  width: 100%;
  height: 100%;
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
</style>
