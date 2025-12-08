<script setup lang="ts">
import { ref } from 'vue'

const message = ref('')

const sendMessage = async () => {
  if (message.value.trim()) {
    // 发送消息到主进程，进而调用主窗口的WebViews实例
    (window as any).ipcRenderer.send('send-message-to-main-window', message.value)
    message.value = ''
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
        <button @click="sendMessage">
          <img class="send-icon" src="./assets/sendIcon.svg"/>
        </button>
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
  padding: 14px 60px 14px 16px;
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

.input-container button {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4), 0 2px 8px rgba(118, 75, 162, 0.2);
  animation: subtle-pulse 2s infinite;
}

.input-container button:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6), 0 4px 12px rgba(118, 75, 162, 0.3);
}

.input-container button:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4), 0 1px 4px rgba(118, 75, 162, 0.2);
}

@keyframes subtle-pulse {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4), 0 2px 8px rgba(118, 75, 162, 0.2);
  }
  50% {
    box-shadow: 0 4px 18px rgba(102, 126, 234, 0.5), 0 2px 10px rgba(118, 75, 162, 0.25);
  }
}

.input-container button .send-icon {
  fill: white;
  width: 25px;
  height: 25px;
  margin-top: 2px;
}
</style>
