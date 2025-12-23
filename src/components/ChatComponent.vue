<template>
  <div class="chat-container">
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']"
      >
        <div class="message-content">
          <pre v-if="message.role === 'assistant'">{{ message.content }}</pre>
          <span v-else>{{ message.content }}</span>
        </div>
      </div>
      <div v-if="isLoading" class="message assistant-message">
        <div class="message-content typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
    <div class="chat-input">
      <textarea
        v-model="inputMessage"
        @keydown.enter.exact.prevent="sendMessage"
        placeholder="输入您的消息..."
        :disabled="isLoading"
        rows="3"
      ></textarea>
      <button
        @click="sendMessage"
        :disabled="isLoading || !inputMessage.trim()"
        class="send-button"
      >
        发送
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement>()

// 模拟API调用 - 在实际应用中，这里会调用electron的LLMConversation
const sendToLLM = async (message: string): Promise<string> => {
  // 这里应该通过electron的IPC调用LLMConversation
  // 暂时模拟响应
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  return `这是对"${message}"的模拟回复。`
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage: ChatMessage = {
    role: 'user',
    content: inputMessage.value.trim()
  }

  messages.value.push(userMessage)
  const currentInput = inputMessage.value.trim()
  inputMessage.value = ''
  isLoading.value = true

  await nextTick()
  scrollToBottom()

  try {
    const response = await sendToLLM(currentInput)
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response
    }
    messages.value.push(assistantMessage)
  } catch (error) {
    console.error('发送消息失败:', error)
    const errorMessage: ChatMessage = {
      role: 'assistant',
      content: '抱歉，发送消息时出现错误，请稍后重试。'
    }
    messages.value.push(errorMessage)
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(() => {
  // 可以在这里添加欢迎消息
  messages.value.push({
    role: 'assistant',
    content: '您好！我是AI助手，请问有什么可以帮助您的吗？'
  })
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background: #f5f5f5;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  margin-bottom: 8px;
}

.user-message {
  justify-content: flex-end;
}

.assistant-message {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.user-message .message-content {
  background: #007bff;
  color: white;
  border-bottom-right-radius: 4px;
}

.assistant-message .message-content {
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.assistant-message .message-content pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
}

.chat-input {
  display: flex;
  padding: 20px;
  background: white;
  border-top: 1px solid #e0e0e0;
  gap: 12px;
}

.chat-input textarea {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
  resize: none;
  font-size: 14px;
  line-height: 1.4;
}

.chat-input textarea:focus {
  outline: none;
  border-color: #007bff;
}

.chat-input textarea:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.send-button {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #0056b3;
}

.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
