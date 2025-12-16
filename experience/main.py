from execute_js import execute_js
from webpage_analyzer import create_browser_context
from configuration import conversation_file
import asyncio, json, ast
from typing import List, Dict

async def chat_many():
    with open(conversation_file, 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    query = "123"
    playwright_instance, browser, context, page = await create_browser_context(headless=False)
    query_js = """(async function universalFill(message, sendSelector = '', startDelay = 0) {
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
})"""+f"(\"{query}\");"
    query_js = query_js.replace('{SELECTOR}', 'div[contenteditable="true"][role="textbox"][data-lexical-editor="true"]')
    result_list, console_logs, screenshot_path, search_url = await execute_js([query_js], json_data[0]['url'], playwright_instance, browser, context, page)
    result_list, console_logs, screenshot_path, search_url = await execute_js([json_data[0]['code']], search_url, playwright_instance, browser, context, page)
    result: List[List[Dict[str, str]]] = json.loads(result_list[0])
    print(result)

if __name__ == "__main__":
    asyncio.run(chat_many())
