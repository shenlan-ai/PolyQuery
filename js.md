## 通用的JavaScript代码模板1（使用document.execCommand有些过时，并且不能适配div作为文本输入框）
### 使用方法:const code = codeTemplate.replace('{SELECTOR}', urlSelectors[url]) + '(' + JSON.stringify(message) + ')'
```js
(function(message) {
  const input = document.querySelector('{SELECTOR}');
  if (input) {
    // 工具函数：模拟真实事件触发（确保事件能被框架捕获）
    const triggerEvent = (element, eventType, eventOptions = {}) => {
      const event = new Event(eventType, {
        bubbles: true,
        composed: true,
        ...eventOptions
      });
      // 适配 React/Vue 框架的事件识别
      if (eventType === 'input') event._reactName = 'onInput';
      if (eventType === 'click') event._reactName = 'onClick';
      element.dispatchEvent(event);
    };
    // 完整模拟用户操作流程
    const simulateUserInput = async () => {
      try {
        // 1. 先滚动到输入框（模拟用户找到输入框）
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(resolve => setTimeout(resolve, 200)); // 模拟滚动耗时
        // 2. 模拟鼠标点击输入框（获取焦点，不直接调用 focus()）
        triggerEvent(input, 'mousedown'); // 鼠标按下
        await new Promise(resolve => setTimeout(resolve, 50)); // 按下延迟
        triggerEvent(input, 'click'); // 鼠标点击
        await new Promise(resolve => setTimeout(resolve, 50)); // 点击延迟
        triggerEvent(input, 'mouseup'); // 鼠标松开
        await new Promise(resolve => setTimeout(resolve, 100)); // 聚焦后延迟
        // 3. 模拟用户清空输入框（若有旧内容，模拟按退格键）
        const currentValue = input.value;
        if (currentValue) {
          for (let i = 0; i < currentValue.length; i++) {
            // 模拟按退格键删除
            const backspaceEvent = new KeyboardEvent('keydown', {
              key: 'Backspace',
              code: 'Backspace',
              bubbles: true,
              composed: true,
              keyCode: 8
            });
            input.dispatchEvent(backspaceEvent);
            document.execCommand('delete', false); // 执行删除操作
            triggerEvent(input, 'input');
            await new Promise(resolve => setTimeout(resolve, 10));
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        // 4. 输入
        console.log('模拟输入:', message);
        document.execCommand('insertText', false, message);
        // 5. 输入完成后，模拟鼠标离开输入框（失去焦点）
        triggerEvent(input, 'mouseleave');
        triggerEvent(input, 'blur');
        triggerEvent(input, 'change'); // 确认输入变更
        // 6. 延迟 100ms 再按回车，模拟用户思考/确认的时间
        await new Promise(resolve => setTimeout(resolve, 100));
        // 7. 模拟按回车发送
        console.log('Enter down');
        input.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          bubbles: true,
          composed: true,
          cancelable: true
        }));
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log('Enter up');
        input.dispatchEvent(new KeyboardEvent('keyup', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          bubbles: true,
          composed: true,
          cancelable: true
        }));
        console.log('模拟用户输入完成！');
      } catch (error) {
        console.error('模拟输入失败：', error);
      }
    };
    // 启动模拟（延迟 500ms，避免与页面加载冲突）
    setTimeout(simulateUserInput, 500);
  } else {
    console.error('未找到目标输入框');
  }
})
```

## 通用的JavaScript代码模板2（相对完美的选择）
### 使用方法:const code = codeTemplate.replace('{SELECTOR}', urlSelectors[url]) + `(${JSON.stringify(message)})`
```js
/**
 * 通用输入框自动填充并发送
 * @param {string} selector        输入框选择器（必填）
 * @param {string} message         待输入文本（必填）
 * @param {string} [sendSelector]  发送按钮选择器（可选，留空则回车发送）
 * @param {number} [startDelay]    启动延迟 ms（默认 0）
 * @returns {Promise<void>}
 */
(async function universalFill(message, sendSelector = '', startDelay = 0) {
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
})
```