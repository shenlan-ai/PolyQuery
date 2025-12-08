import { createApp } from 'vue'
import './style.css'
import Smallwin from './Smallwin.vue'

createApp(Smallwin).mount('#smallwin').$nextTick(() => {
  // Use contextBridge
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
})