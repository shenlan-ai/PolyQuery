<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { websites } from '../types/website'

const webviews = ref<Record<string, HTMLWebViewElement>>({})
const webviewReady = ref<Record<string, boolean>>({})
const containerRef = ref<HTMLElement | null>(null)
const maximizedUrl = ref<string | null>(null)

// 通用的JavaScript代码模板（相对完美的选择）
const codeTemplate = `
/**
 * 通用输入框自动填充并发送
 * @param {string} selector        输入框选择器（必填）
 * @param {string} message         待输入文本（必填）
 * @param {string} [sendSelector]  发送按钮选择器（可选，留空则回车发送）
 * @param {number} [startDelay]    启动延迟 ms（默认 0）
 * @param {string} [url]           跳转url（可选，如果不为空且当前url不同，先跳转到指定url）
 * @returns {Promise<void>}
 */
(async function universalFill(message, sendSelector = '', startDelay = 0, url = '') {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  /* ---------- 工具函数 ---------- */
  async function waitFor(sel, timeout = 10_000) {
    const t0 = Date.now();
    const find = () => {
      let el = document.querySelector(sel);
      if (el) return el;
      for (const n of document.querySelectorAll('*')) {
        if (n.shadowRoot) {
          el = n.shadowRoot.querySelector(sel);
          if (el) return el;
        }
      }
      return null;
    };
    return new Promise((resolve, reject) => {
      const loop = () => {
        const node = find();
        if (node) return resolve(node);
        if (Date.now() - t0 > timeout) return reject('timeout');
        requestAnimationFrame(loop);
      };
      loop();
    });
  }
  function fire(el, type, opts = {}) {
    const evt = new (type === 'click' ? MouseEvent : Event)(type, { bubbles: true, composed: true, ...opts });
    if (type === 'input')  evt._reactName = 'onInput';
    if (type === 'change') evt._reactName = 'onChange';
    el.dispatchEvent(evt);
  }
  function nativeSetValue(el, val) {
    const map = { INPUT: 'HTMLInputElement', TEXTAREA: 'HTMLTextAreaElement', SELECT: 'HTMLSelectElement' };
    const protoName = map[el.tagName];
    if (!protoName) throw new Error('Unsupported element: ' + el.tagName);
    const setter = Object.getOwnPropertyDescriptor(window[protoName].prototype, 'value').set;
    setter.call(el, val);
    fire(el, 'input');
    fire(el, 'change');
  }
  async function typeEditable(el, text) {
    el.focus();
    getSelection().selectAllChildren(el);
    getSelection().deleteFromDocument();
    for (const ch of text) {
      el.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', data: ch }));
      document.execCommand('insertText', false, ch);
      el.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: ch }));
      await sleep(20);
    }
  }
  /* ---------- 主流程 ---------- */
  if (startDelay > 0) await sleep(startDelay);
  if (url && window.location.href !== url) {
    window.location.href = url;
    return;
  }
  try {
    const input = await waitFor('{SELECTOR}');
    console.log('[UniversalFill] 节点已找到', input);
    if ('value' in input && input.tagName !== 'DIV') {
      nativeSetValue(input, message);
    } else if (input.contentEditable === 'true') {
      await typeEditable(input, message);
    } else {
      throw new Error('未知输入类型，请检查 selector');
    }
    await sleep(150);
    if (sendSelector) {
      const btn = await waitFor(sendSelector);
      btn.click();
      console.log('[UniversalFill] 已点击发送按钮');
    } else {
      ['keydown', 'keyup'].forEach(type =>
        input.dispatchEvent(new KeyboardEvent(type, { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true, composed: true }))
      );
      console.log('[UniversalFill] 已回车发送');
    }
    console.log('[UniversalFill] 全部完成！');
  } catch (e) {
    console.error('[UniversalFill]', e);
  }
})`

const onDomReady = (url: string) => {
  console.log(`Webview ${url} dom-ready`)
}

const onLoad = (url: string) => {
  console.log(`Webview ${url} loaded`)
  webviewReady.value[url] = true
  // 打开webview的开发者工具用于调试
  // if (url.includes('bing') && webviews.value[url]) {
  //   try {
  //     webviews.value[url].openDevTools()
  //   } catch (error) {
  //     console.error(`Failed to open DevTools for webview ${url}:`, error)
  //   }
  // }
}

const setRef = (url: string, el: HTMLWebViewElement | null) => {
  if (el) {
    webviews.value[url] = el
  } else {
    delete webviews.value[url]
  }
}

const sendMessage = async (message: string) => {
  if (message.trim()) {
    console.log('发送消息:', message)
    websites.forEach((website) => {
      const webview = webviews.value[website.url]
      if (webview && webviewReady.value[website.url]) {
        const code = codeTemplate.replace('{SELECTOR}', website.selector) + `(${JSON.stringify(message)})`
        // console.log(`Executing code for ${website.url}:`, code)
        webview.executeJavaScript(code).catch((error: any) => {
          console.error('executeJavaScript failed for', website.url, error)
        })
      } else {
        console.log(`Webview not ready for ${website.url}`)
      }
    })
  }
}

// 滚动到指定网站的位置
const scrollToWebsite = (url: string) => {
  nextTick(() => {
    if (!containerRef.value) return
    // 找到对应的webview wrapper
    const wrapper = containerRef.value.querySelector(`[data-website-url="${url}"]`) as HTMLElement
    if (wrapper) {
      // 使用scrollIntoView平滑滚动到该位置
      wrapper.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  })
}

// 切换最大化状态
const toggleMaximize = (url: string) => {
  if (maximizedUrl.value === url) {
    maximizedUrl.value = null
  } else {
    maximizedUrl.value = url
  }
}

// 获取相邻的网站
const getAdjacentWebsite = (currentUrl: string, direction: 'prev' | 'next'): string | null => {
  const currentIndex = websites.findIndex(w => w.url === currentUrl)
  if (currentIndex === -1) return null

  let targetIndex
  if (direction === 'prev') {
    targetIndex = currentIndex - 1
  } else {
    targetIndex = currentIndex + 1
  }

  if (targetIndex >= 0 && targetIndex < websites.length) {
    return websites[targetIndex].url
  }
  return null
}

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (!maximizedUrl.value) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    const prevUrl = getAdjacentWebsite(maximizedUrl.value, 'prev')
    if (prevUrl) {
      maximizedUrl.value = prevUrl
    }
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    const nextUrl = getAdjacentWebsite(maximizedUrl.value, 'next')
    if (nextUrl) {
      maximizedUrl.value = nextUrl
    }
  }
}

// 生命周期钩子
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// 暴露发送消息的方法给父组件
defineExpose({
  sendMessage,
  scrollToWebsite
})
</script>

<template>
  <div ref="containerRef" class="container" :class="{ 'maximized': maximizedUrl }">
    <div
      v-for="website in websites"
      :key="website.url"
      class="webview-wrapper"
      :class="{ 'maximized': maximizedUrl === website.url, 'hidden': maximizedUrl && maximizedUrl !== website.url }"
      :data-website-url="website.url"
    >
      <div class="webview-title">
        <span style="font-weight: 600;">{{ website.name }}</span>
        <button
          class="maximize-btn"
          @click="toggleMaximize(website.url)"
          :title="maximizedUrl === website.url ? '还原' : '最大化'"
        >
          {{ maximizedUrl === website.url ? '⛶' : '⛶' }}
        </button>
      </div>
      <webview
        :src="website.url"
        :ref="(el: HTMLWebViewElement | null) => setRef(website.url, el)"
        class="webview"
        webpreferences="contextIsolation=no,nodeIntegration=yes,webSecurity=no"
        @dom-ready="() => onDomReady(website.url)"
        @load-commit="() => onLoad(website.url)"
      ></webview>
    </div>
  </div>
</template>

<style scoped>
.container {
  flex: 1;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  margin: 0;
  /* padding: 12px; */
  background: #faf9f6;
  gap: 12px;
}

.webview-wrapper {
  display: flex;
  flex-direction: column;
  min-width: 800px;
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin: 0;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Claude风格的柔和颜色主题 */
.webview-wrapper:nth-child(7n+1) {
  border-color: #e0e7ff;
}

.webview-wrapper:nth-child(7n+1) .webview-title {
  background: #f0f4ff;
  color: #6366f1;
  border-bottom-color: #e0e7ff;
}

.webview-wrapper:nth-child(7n+2) {
  border-color: #fce7f3;
}

.webview-wrapper:nth-child(7n+2) .webview-title {
  background: #fdf2f8;
  color: #ec4899;
  border-bottom-color: #fce7f3;
}

.webview-wrapper:nth-child(7n+3) {
  border-color: #dbeafe;
}

.webview-wrapper:nth-child(7n+3) .webview-title {
  background: #eff6ff;
  color: #3b82f6;
  border-bottom-color: #dbeafe;
}

.webview-wrapper:nth-child(7n+4) {
  border-color: #dcfce7;
}

.webview-wrapper:nth-child(7n+4) .webview-title {
  background: #f0fdf4;
  color: #22c55e;
  border-bottom-color: #dcfce7;
}

.webview-wrapper:nth-child(7n+5) {
  border-color: #fef3c7;
}

.webview-wrapper:nth-child(7n+5) .webview-title {
  background: #fffbeb;
  color: #f59e0b;
  border-bottom-color: #fef3c7;
}

.webview-wrapper:nth-child(7n+6) {
  border-color: #e9d5ff;
}

.webview-wrapper:nth-child(7n+6) .webview-title {
  background: #faf5ff;
  color: #a855f7;
  border-bottom-color: #e9d5ff;
}

.webview-wrapper:nth-child(7n) {
  border-color: #fed7aa;
}

.webview-wrapper:nth-child(7n) .webview-title {
  background: #fff7ed;
  color: #f97316;
  border-bottom-color: #fed7aa;
}

.webview-title {
  padding: 8px 8px;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.webview {
  flex: 1;
  border: none;
  margin: 0;
  padding: 0;
  min-width: 800px;
  background: #ffffff;
}

/* 最大化状态 */
.container.maximized {
  overflow: hidden;
  padding: 0;
}

.webview-wrapper.maximized {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  border-radius: 0;
  margin: 0;
  min-width: unset;
}

.webview-wrapper.maximized .webview {
  min-width: unset;
}

.webview-wrapper.hidden {
  display: none;
}

.maximize-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: inherit;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.maximize-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
