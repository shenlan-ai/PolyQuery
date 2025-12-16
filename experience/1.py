import json
from typing import List, Dict
import re
# 示例字符串（JSON 格式）
s = """[\n  {\n    "role": "user",\n    "content": "123"\n  },\n  {\n    "role": "assistant",\n    "content": "你好！请问有什么可以帮你的吗？"\n  }\n]"""
# 正则匹配所有空白字符（\s 等价于 [ \t\n\r\v\f]）
# s = re.sub(r"\s", "", s)
print(s)
# 解析为 list[dict]
data: List[List[Dict[str, str]]] = json.loads(s)

# 验证
print(data)
# 输出: [{'role': 'user', 'content': 'hello'}, {'role': 'assistant', 'content': 'hi!'}]

print(type(data))           # <class 'list'>
print(type(data[0]))        # <class 'dict'>
print(data[0]["role"])      # user