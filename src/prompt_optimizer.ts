import LLMConversation from './llm_conversation.ts';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// 注意：RAG 相关的导入和函数在 TypeScript 中可能需要单独实现或导入
// 这里假设 retrieve_similar_prompts 存在或简化实现

// 假设的 RAG 函数签名（需要实际实现）
async function retrieve_similar_prompts(prompt: string, index: any, keys: any, prompts: any, k: number): Promise<any[]> {
  // 这里需要实现或导入实际的 RAG 逻辑
  // 暂时返回空数组
  console.log(prompt, index, keys, prompts, k)
  return [];
}

export async function optimizePrompt(prompt: string, conversation: LLMConversation, k: number = 3): Promise<string> {
  let similarPrompts: string[] = [];
  try {
    // 假设 FAISS 索引和数据已加载（在 TS 中需要相应的库）
    // 这里简化，实际需要实现加载逻辑
    const index = null; // faiss.read_index('RAG\\faiss_index.idx');
    const keys = {}; // JSON.parse(fs.readFileSync('RAG\\prompt_keys.json', 'utf-8'));
    const prompts = {}; // JSON.parse(fs.readFileSync('RAG\\prompt_texts.json', 'utf-8'));
    console.log("已加载现有索引");
    const similar = await retrieve_similar_prompts(prompt, index, keys, prompts, k);
    if (similar) {
      similarPrompts = similar.map((p: any) => p.prompt);
    }
    else {
      similarPrompts = [
        "Imagine you are an experienced Ethereum developer tasked with creating a smart\ncontract for a blockchain messenger. The objective is to save messages on the\nblockchain, making them readable (public) to everyone, writable (private) only\nto the person who deployed the contract, and to count how many times the\nmessage was updated. Develop a Solidity smart contract for this purpose,\nincluding the necessary functions and considerations for achieving the\nspecified goals. Please provide the code and any relevant explanations to\nensure a clear understanding of the implementation.",
        "I want you to act as a linux terminal. I will type commands and you will reply\nwith what the terminal should show. I want you to only reply with the terminal\noutput inside one unique code block, and nothing else. do not write\nexplanations. do not type commands unless I instruct you to do so. When I need\nto tell you something in English, I will do so by putting text inside curly\nbrackets {like this}. My first command is pwd",
        "I want you to act as an English translator, spelling corrector and improver. I\nwill speak to you in any language and you will detect the language, translate\nit and answer in the corrected and improved version of my text, in English. I\nwant you to replace my simplified A0-level words and sentences with more\nbeautiful and elegant, upper level English words and sentences. Keep the\nmeaning same, but make them more literary. I want you to only reply the\ncorrection, the improvements and nothing else, do not write explanations. My\nfirst sentence is “istanbulu cok seviyom burada olmak cok guzel”",
    ];
    }
  } catch (error) {
    console.log("RAG 索引未找到或加载失败");
    return "";
  }
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "你是一个卓越的提示词工程师，你的工作是优化提示词，从而最大程度上激发LLM的能力。"
    },
    {
      role: "user",
      content: `${similarPrompts}\n参考上面的${k}段提示词模板，仿照模板的格式为我优化下面的提示词：\n${prompt}。\n只给出优化后的提示词，不要输出任何其他内容。优化后的提示词的语言（中文、英文等）要和优化前的语言一致`
    }
  ];
  const response = await conversation.sendMessage(messages, 5000);
  console.log('response:', response)
  return response;
}

export async function generateWebsiteAnalysis(url: string, conversation: LLMConversation): Promise<any> {
  const schema = `{
    "url": "${url}",
    "网站主要功能与特色介绍": "介绍网站的主要功能和特色",
    "网站站内搜索输入框输入内容示例": ["示例1", "示例2", "示例3"]
  }`;
  const data = await conversation.sendMessage([
    {
      role: "user",
      content: `这里有一个网站${url}，请根据网站的特性，按以下格式输出以下内容：\n${schema}`
    }
  ]);
  return JSON.parse(data);
}

export async function generateSearchQuery(prompt: string, urlData: Record<string, any>, conversation: LLMConversation): Promise<string> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "你是一个卓越的信息搜索助手，你的工作是根据用户需求和不同网站的特点，为不同的网站设计合适的搜索内容，从而更好的获取信息。"
    },
    {
      role: "user",
      content: `用户的需求是：${prompt}。\n目标网站的信息如下:\n${JSON.stringify(urlData)}\n根据用户需求与网站信息，为我设计一份合适的搜索输入内容用来在该网站内进行搜索，从而为用户提供更加优质的搜索结果。只需要输出向网站的搜索输入框输入的内容即可。`
    }
  ];
  const response = await conversation.sendMessage(messages, 5000);
  return response;
}
