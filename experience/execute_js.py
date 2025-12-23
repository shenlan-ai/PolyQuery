import asyncio
# from llm_conversation import LLMConversation
from webpage_analyzer import *
from configuration import cookie_file, code_llm_config
# from filter_code import filter_code

async def execute_js(js_code_list: list[str], url: str, playwright_instance=None, browser=None, context=None, page=None):
    console_logs = []
    create_browser = False
    if playwright_instance is None or browser is None or context is None or page is None:
        create_browser = True
        playwright_instance, browser, context, page = await create_browser_context(headless=False)
    try:
        def handle_console(msg):
            console_logs.append(f"{msg.type}: {msg.text}")
        page.on('console', handle_console)
        if page.url != url:
            await page.goto(url, wait_until='domcontentloaded') 
        await simulate_human_behavior(page)
        await asyncio.sleep(random.uniform(1, 3))
        result_list = []
        for js_code in js_code_list:
            try:
                # print(f"执行JS代码: {js_code}")
                result_list.append(await page.evaluate(js_code))
                await page.wait_for_load_state('domcontentloaded')
                await asyncio.sleep(random.uniform(3, 5))
            except Exception as e:
                result_list.append(f"执行JS代码{js_code}时出错: {e}")
                break
        screenshot_dir = 'screenshots'
        os.makedirs(screenshot_dir, exist_ok=True)
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        screenshot_path = os.path.join(screenshot_dir, f'screenshot_{timestamp}.png')
        await page.screenshot(path=screenshot_path)
        search_url = page.url
        # print(f"当前页面 URL: {search_url}")
    except Exception as e:
        return [f"出错: {e}"], [], "", page.url
    finally:
        if create_browser:
            await page.close()
            await context.close()
            await browser.close()
            await playwright_instance.stop()
    return result_list, console_logs, screenshot_path, search_url

# async def execute_js_codes_in_pages(js_code_list: list[str], url_list: list[str], playwright_instance, browser, context, page_list):
#     console_logs = []
#     create_browser = False
#     try:
#         def handle_console(msg):
#             console_logs.append(f"{msg.type}: {msg.text}")
#         page.on('console', handle_console)
#         if page.url != url:
#             await page.goto(url, wait_until='domcontentloaded') 
#         await simulate_human_behavior(page)
#         await asyncio.sleep(random.uniform(1, 3))
#         result_list = []
#         for js_code in js_code_list:
#             try:
#                 result_list.append(await page.evaluate(js_code))
#                 await page.wait_for_load_state('domcontentloaded')
#                 await asyncio.sleep(random.uniform(3, 5))
#             except Exception as e:
#                 result_list.append(f"执行JS代码{js_code}时出错: {e}")
#                 break
#         screenshot_dir = 'screenshots'
#         os.makedirs(screenshot_dir, exist_ok=True)
#         timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
#         screenshot_path = os.path.join(screenshot_dir, f'screenshot_{timestamp}.png')
#         await page.screenshot(path=screenshot_path)
#         search_url = page.url
#         print(f"当前页面 URL: {search_url}")
#     except Exception as e:
#         return [f"出错: {e}"], [], "", page.url
#     finally:
#         if create_browser:
#             await page.close()
#             await context.close()
#             await browser.close()
#             await playwright_instance.stop()
#     return result_list, console_logs, screenshot_path, search_url


if __name__ == "__main__":
    with open("code/crawl_search_result.js", "r", encoding="utf-8") as f:
        js_code = f.read()
    result_list, console_logs, screenshot_path, search_url = asyncio.run(execute_js([js_code], "https://www.zhihu.com/search?q=如何学习JavaScript"))
    print(f"执行结果: {result_list}")
    print(f"search_url: {search_url}")
