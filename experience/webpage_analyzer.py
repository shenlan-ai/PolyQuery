import json
import asyncio
import random
import time
import datetime
from patchright.sync_api import sync_playwright
from patchright.async_api import async_playwright
# from llm_conversation import LLMConversation
import tempfile
import os
from fake_useragent import UserAgent
from configuration import cookie_file

# Initialize fake user agent generator
try:
    ua = UserAgent()
except:
    ua = None

# List of User-Agents for simulating real browsers (fallback)
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
]

# List of languages and timezones for randomization
LANGUAGES = ['en-US', 'zh-CN', 'ja-JP', 'ko-KR', 'de-DE', 'fr-FR']
TIMEZONES = ['America/New_York', 'Europe/London', 'Asia/Shanghai', 'Asia/Tokyo', 'Europe/Berlin', 'America/Los_Angeles']

def get_random_user_agent():
    """Return a random User-Agent using fake-useragent or fallback."""
    # if ua:
    #     try:
    #         return ua.random
    #     except Exception as e:
    #         print(f"使用 fake-useragent 失败，回退到静态列表: {e}")
    return random.choice(USER_AGENTS)

def get_random_locale():
    """Return a random locale."""
    return random.choice(LANGUAGES)

def get_random_timezone():
    """Return a random timezone."""
    return random.choice(TIMEZONES)

async def hide_automation_features(page):
    """Hide automation features by modifying browser properties."""
    await page.evaluate("""
        // Hide webdriver property
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });

        // Mock plugins
        Object.defineProperty(navigator, 'plugins', {
            get: () => [
                {name: 'Chrome PDF Plugin', description: 'Portable Document Format', filename: 'internal-pdf-viewer'},
                {name: 'Chrome PDF Viewer', description: '', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai'},
                {name: 'Native Client', description: '', filename: 'internal-nacl-plugin'},
            ],
        });

        // Mock languages
        Object.defineProperty(navigator, 'languages', {
            get: () => ['zh-CN', 'zh', 'en'],
        });

        // Mock permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );

        // Remove automation indicators
        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
        delete window.cdc_adoQpoasnfa76pfcZLmcfl_JSON;
        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Object;
        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Proxy;
    """)

async def simulate_human_behavior(page):
    """Simulate human-like browsing behavior."""
    # Random scrolling
    for _ in range(random.randint(1, 5)):
        scroll_distance = random.randint(100, 500)
        await page.evaluate(f"window.scrollBy(0, {scroll_distance})")
        await asyncio.sleep(random.uniform(0.5, 2))

    # Random mouse movements
    for _ in range(random.randint(3, 8)):
        x = random.randint(0, 1200)
        y = random.randint(0, 800)
        await page.mouse.move(x, y)
        await asyncio.sleep(random.uniform(0.1, 0.5))

    # More scrolling
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
    await asyncio.sleep(random.uniform(1, 3))
    await page.evaluate("window.scrollTo(0, 0)")
    await asyncio.sleep(random.uniform(0.5, 2))

async def check_login_required(url: str) -> bool:
    """
    使用 playwright 检查 URL 是否需要登录。
    """
    playwright_instance, browser, context, page = await create_browser_context(headless=False)
    try:
        await page.goto(url, wait_until='domcontentloaded')
        # 模拟轻微用户行为
        await asyncio.sleep(random.uniform(0.5, 2))
        await page.mouse.move(random.randint(100, 500), random.randint(100, 500))
        await asyncio.sleep(random.uniform(0.5, 1))
        content = await page.inner_text('body')
        content = content.lower()
        # 检查是否有登录相关关键词
        login_keywords = ['login', 'sign in', '请登录', '登录', 'signin', 'log in','sign up']
        return any(keyword in content for keyword in login_keywords)
    finally:
        await browser.close()
        await playwright_instance.stop()

async def handle_login(url: str, storage_state_file: str = cookie_file):
    """
    使用有头 playwright 让用户手动登录，并保存存储状态。
    """
    playwright_instance = await async_playwright().start()
    browser = await playwright_instance.chromium.launch(
        headless=False,
        executable_path="C:/Program Files/Google/Chrome/Application/chrome.exe",
        args=[
            '--disable-blink-features=AutomationControlled',
            '--disable-extensions',
            '--no-first-run',
            '--disable-default-apps',
            '--disable-infobars',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-ipc-flooding-protection',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-background-networking',
            '--disable-component-extensions-with-background-pages',
            '--disable-features=TranslateUI,BlinkGenPropertyTrees'
            # 注意：不设置 --window-position，让窗口可见以便用户登录
        ]
    )
    context = await browser.new_context(
        user_agent=get_random_user_agent(),
        viewport={'width': random.randint(1000, 1200), 'height': random.randint(500, 780)},
        locale=get_random_locale(),
        timezone_id=get_random_timezone(),
        ignore_https_errors=True,
        permissions=['geolocation'],
        geolocation={'latitude': random.uniform(-90, 90), 'longitude': random.uniform(-180, 180)},
        storage_state=storage_state_file
    )
    page = await context.new_page()
    try:
        await page.goto(url, wait_until='domcontentloaded')
        # 模拟用户行为以绕过反爬虫
        await asyncio.sleep(random.uniform(1, 3))
        await page.mouse.move(random.randint(100, 500), random.randint(100, 500))
        await asyncio.sleep(random.uniform(0.5, 2))
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight / 4)")
        await asyncio.sleep(random.uniform(1, 3))
        await page.mouse.move(random.randint(600, 1000), random.randint(200, 600))
        await asyncio.sleep(random.uniform(0.5, 2))
        # 等待用户登录
        input("请在浏览器中完成登录后，按 Enter 键继续...")
        await context.storage_state(path=storage_state_file)
    finally:
        await browser.close()
        await playwright_instance.stop()

async def create_browser_context(headless: bool = False, storage_state_file: str = cookie_file):
    """
    创建浏览器上下文，统一管理浏览器启动和配置。

    Args:
        headless: 是否无头模式
        load_storage_state: 是否加载存储状态
        storage_state_file: 存储状态文件路径

    Returns:
        tuple: (playwright_instance, browser, context, page)
    """
    playwright_instance = await async_playwright().start()
    browser = await playwright_instance.chromium.launch(
        headless=headless,
        executable_path="C:/Program Files/Google/Chrome/Application/chrome.exe",
        args=[
            '--disable-blink-features=AutomationControlled',
            '--disable-extensions',
            '--no-first-run',
            '--disable-default-apps',
            '--disable-infobars',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-ipc-flooding-protection',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-background-networking',
            '--disable-component-extensions-with-background-pages',
            '--disable-features=TranslateUI,BlinkGenPropertyTrees',
            '--window-position=-32000,-32000'
        ]
    )
    context = await browser.new_context(
        user_agent=get_random_user_agent(),
        viewport={'width': random.randint(1200, 1920), 'height': random.randint(800, 1080)},
        locale=get_random_locale(),
        timezone_id=get_random_timezone(),
        ignore_https_errors=True,
        permissions=['geolocation'],
        geolocation={'latitude': random.uniform(-90, 90), 'longitude': random.uniform(-180, 180)},
        storage_state=storage_state_file
    )
    page = await context.new_page()
    return playwright_instance, browser, context, page


async def get_picture(url: str) -> str:
    """
    使用playwright获取指定url的图片内容。
    """
    # 检查是否需要登录
    if await check_login_required(url):
        if not os.path.exists(cookie_file):
            await handle_login(url)
    playwright_instance, browser, context, page = await create_browser_context(headless=False)
    try:
        # 访问网页
        await page.goto(url, wait_until='networkidle')
        # 模拟真实用户行为
        await simulate_human_behavior(page)
        # 额外等待，让页面完全加载
        await asyncio.sleep(random.uniform(2, 5))
        # 截取屏幕截图
        screenshot_dir = 'screenshots'
        os.makedirs(screenshot_dir, exist_ok=True)
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        screenshot_path = os.path.join(screenshot_dir, f'screenshot_{timestamp}.png')
        await page.screenshot(path=screenshot_path, full_page=True)
    finally:
        # 清理资源
        await browser.close()
        await playwright_instance.stop()
    return screenshot_path

async def get_html(url: str) -> str:
    """
    获取指定url对应的html内容
    """
    # 检查是否需要登录
    if await check_login_required(url):
        if not os.path.exists(cookie_file):
            await handle_login(url)

    playwright_instance, browser, context, page = await create_browser_context(headless=False)
    try:
        # 访问网页
        await page.goto(url, wait_until='networkidle')
        # 模拟真实用户行为
        await simulate_human_behavior(page)
        # 额外等待，让页面完全加载
        await asyncio.sleep(random.uniform(2, 5))
        html = await page.content()
    finally:
        # 清理资源
        await browser.close()
        await playwright_instance.stop()
    return html

async def get_elements_at_position(url: str, x: int, y: int) -> list:
    """
    获取指定URL在指定x,y坐标处的所有HTML元素。

    Args:
        url (str): 网页URL
        x (int): X坐标
        y (int): Y坐标

    Returns:
        list: 包含该位置所有元素的列表，每个元素包含tagName, id, className, outerHTML等信息
    """
    # 检查是否需要登录
    if await check_login_required(url):
        if not os.path.exists(cookie_file):
            await handle_login(url)

    playwright_instance, browser, context, page = await create_browser_context(headless=False)
    try:
        # 访问网页
        await page.goto(url, wait_until='networkidle')
        # 模拟真实用户行为
        await simulate_human_behavior(page)
        # 额外等待，让页面完全加载
        await asyncio.sleep(random.uniform(2, 5))

        # 使用page.evaluate获取指定坐标处的元素
        elements = await page.evaluate(f"""
            () => {{
                const elements = document.elementsFromPoint({x}, {y});
                return elements.map(element => {{
                    return {{
                        tagName: element.tagName,
                        id: element.id,
                        className: element.className,
                        outerHTML: element.outerHTML.length > 200 ? element.outerHTML.substring(0, 200) + '...' : element.outerHTML,
                        boundingRect: {{
                            left: element.getBoundingClientRect().left,
                            top: element.getBoundingClientRect().top,
                            width: element.getBoundingClientRect().width,
                            height: element.getBoundingClientRect().height
                        }},
                        textContent: element.textContent ? element.textContent.trim().substring(0, 100) : ''
                    }};
                }});
            }}
        """)

        return elements
    finally:
        # 清理资源
        await browser.close()
        await playwright_instance.stop()
