from dotenv import load_dotenv
import os, json
from typing import Any

class LLMConfiguration:
    def __init__(self) -> None:
        """Initialize configuration with environment variables."""
        load_dotenv()
        self.api_key = os.getenv("LLM_API_KEY")
        self.base_url = os.getenv("LLM_BASE_URL")
        self.model = os.getenv("LLM_MODEL")
    @property
    def llm_api_key(self) -> str:
        if not self.api_key:
            raise ValueError("LLM_API_KEY not found in environment variables")
        return self.api_key
    @property
    def llm_base_url(self) -> str:
        if not self.base_url:
            raise ValueError("LLM_BASE_URL not found in environment variables")
        return self.base_url
    @property
    def llm_model(self) -> str:
        if not self.model:
            raise ValueError("LLM_MODEL not found in environment variables")
        return self.model

class CodeLLMConfiguration:
    def __init__(self) -> None:
        """Initialize configuration with environment variables."""
        load_dotenv()
        self.api_key = os.getenv("LLM_API_KEY")
        self.base_url = os.getenv("LLM_BASE_URL")
        self.model = os.getenv("LLM_MODEL")
    @property
    def llm_api_key(self) -> str:
        if not self.api_key:
            raise ValueError("LLM_API_KEY not found in environment variables")
        return self.api_key
    @property
    def llm_base_url(self) -> str:
        if not self.base_url:
            raise ValueError("LLM_BASE_URL not found in environment variables")
        return self.base_url
    @property
    def llm_model(self) -> str:
        if not self.model:
            raise ValueError("LLM_MODEL not found in environment variables")
        return self.model

# class AgentConfiguration:
#     def __init__(self, config_path: str) -> None:
#         data = json.load(open(config_path, encoding="utf-8"))
#         self.agent_name = data["agent_name"]
#         from server import Server
#         self.servers = [Server(name, srv_config) for name, srv_config in data["mcpServers"].items()]

llm_config = LLMConfiguration()
code_llm_config = CodeLLMConfiguration()
cookie_file = "experience/cookies.json"
conversation_file = "experience/crawl_conversation.json"
