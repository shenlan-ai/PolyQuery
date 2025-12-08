import { reactive } from 'vue'

export const WEBSITE_CATEGORIES = reactive(['AI', 'Content Platform', 'Search Engine'])

export type WebsiteCategory = string

export interface Website {
  url: string
  name: string
  selector: string
  category: WebsiteCategory
}

type WebsiteConfig = Omit<Website, 'name'>

const titleRegex = /<title>([\s\S]*?)<\/title>/i

const getFallbackName = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

const createWebsite = (config: WebsiteConfig): Website => ({
  ...config,
  name: getFallbackName(config.url),
})

const refreshNames = (list: Website[]) => {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return
  }

  list.forEach(async website => {
    try {
      const response = await fetch(website.url, { method: 'GET' })
      const html = await response.text()
      const match = html.match(titleRegex)
      if (match?.[1]) {
        website.name = match[1].trim()
      }
    } catch (error) {
      console.warn(`Failed to fetch title for ${website.url}`, error)
    } finally {
      if (!website.name) {
        website.name = getFallbackName(website.url)
      }
    }
  })
}

const defaultWebsiteConfigs: WebsiteConfig[] = [
  {
    url: 'https://chatgpt.com/',
    selector: `div[contenteditable="true"]`,
    category: 'AI'
  },
  {
    url: 'https://www.kimi.com',
    selector: `div[contenteditable="true"][role="textbox"][data-lexical-editor="true"]`,
    category: 'AI'
  },
  {
    url: 'https://manus.im/app',
    selector: `textarea`,
    category: 'AI'
  },
  {
    url: 'https://www.tongyi.com',
    selector: `textarea`,
    category: 'AI'
  },
]

const defaultAllWebsiteConfigs: WebsiteConfig[] = [
  {
    url: 'https://chatgpt.com/',
    selector: `div[contenteditable="true"]`,
    category: 'AI'
  },
  {
    url: 'https://www.kimi.com',
    selector: `div[contenteditable="true"][role="textbox"][data-lexical-editor="true"]`,
    category: 'AI'
  },
  {
    url: 'https://manus.im/app',
    selector: `textarea`,
    category: 'AI'
  },
  {
    url: 'https://www.tongyi.com',
    selector: `textarea`,
    category: 'AI'
  },
  
  {
    url: 'https://yuanbao.tencent.com/',
    selector: `div[contenteditable="true"]`,
    category: 'AI'
  },
  {
    url: 'https://chat.deepseek.com/',
    selector: `textarea`,
    category: 'AI'
  },
  {
    url: 'https://yiyan.baidu.com/',
    selector: `div[contenteditable="true"]`,
    category: 'AI'
  },
  {
    url: 'https://www.doubao.com',
    selector: `textarea[data-testid="chat_input_input"]`,
    category: 'AI'
  },
  // {
  //   url: 'https://chatglm.cn/',
  //   selector: `textarea`,
  //   category: 'AI'
  // },
  // {
  //   url: 'https://www.tiangong.cn/',
  //   selector: `.el-textarea__inner`,
  //   category: 'AI'
  // },
  // {
  //   url: 'https://taichu-web.ia.ac.cn/',
  //   selector: `textarea`,
  //   category: 'AI'
  // },
  {
    url: 'https://www.wanzhi.com/',
    selector: `textarea`,
    category: 'AI'
  },
  {
    url: 'https://ying.baichuan-ai.com/',
    selector: `textarea`,
    category: 'AI'
  },
  // {
  //   url: 'https://chat.sensetime.com/',
  //   selector: `textarea`,
  //   category: 'AI'
  // },
  
  {
    url: 'https://www.wenxiaobai.com/',
    selector: `textarea`,
    category: 'AI'
  },
  {
    url: 'https://x.ai/',
    selector: `textarea`,
    category: 'AI'
  },
  
  {
    url: 'https://space.coze.cn/',
    selector: `div[contenteditable="true"]`,
    category: 'AI'
  },
  {
    url: 'https://www.n.cn/',
    selector: `textarea`,
    category: 'AI'
  },
  {
    url: 'https://metaso.cn/',
    selector: `textarea`,
    category: 'AI'
  },
  {
    url: 'https://flowith.net/',
    selector: `textarea`,
    category: 'AI'
  },
  // {
  //   url: 'https://www.perplexity.ai/',
  //   selector: `div[contenteditable="true"]`,
  //   category: 'AI'
  // },
  {
    url: 'https://skywork.ai/',
    selector: `div[contenteditable="inherit"]`,
    category: 'AI'
  },
  // {
  //   url:'https://www.zhihu.com/',
  //   selector: `textarea`,
  //   category: 'Content Platform'
  // },
  // {
  //   url: 'https://www.douyin.com/',
  //   selector: `input`,
  //   category: 'Content Platform'
  // },
  // {
  //   url: 'https://www.tiktok.com/explore/',
  //   selector: `input`,
  //   category: 'Content Platform'
  // },
  // {
  //   url: 'https://www.toutiao.com/',
  //   selector: `input`,
  //   category: 'Content Platform'
  // },
  // {
  //   url: 'https://www.kuaishou.com/new-reco',
  //   selector: `input`,
  //   category: 'Content Platform'
  // },
  // {
  //   url: 'https://www.bilibili.com/',
  //   selector: `textarea`,
  //   category: 'Content Platform'
  // },
  // {
  //   url: 'https://www.youtube.com/',
  //   selector: `textarea`,
  //   category: 'Content Platform'
  // },
  // {
  //   url: 'https://sspai.com/',
  //   selector: `input`,
  //   category: 'Content Platform'
  // },
  // {
  //   url: 'https://blog.csdn.net/',
  //   selector: `input`,
  //   category: 'Content Platform'
  // },
  // {
  //   url: 'https://scholar.google.com/',
  //   selector: `textarea`,
  //   category: 'Search Engine'
  // },
  // {
  //   url: 'https://www.bing.com/',
  //   selector: `input#sb_form_q`,
  //   category: 'Search Engine'
  // },
  // {
  //   url: 'https://www.google.com/',
  //   selector: `textarea`,
  //   category: 'Search Engine'
  // }
]

// 可修改的配置变量
let websiteConfigs: WebsiteConfig[] = [...defaultWebsiteConfigs]
let allWebsiteConfigs: WebsiteConfig[] = [...defaultAllWebsiteConfigs]

export const websites: Website[] = reactive(websiteConfigs.map(createWebsite))
export const all_websites: Website[] = reactive(allWebsiteConfigs.map(createWebsite))

refreshNames(websites)
refreshNames(all_websites)

export const addWebsite = (website: Website) => {
  const exists = websites.some(w => w.url === website.url)
  if (!exists) {
    websites.push(website)
    const config: WebsiteConfig = { url: website.url, selector: website.selector, category: website.category }
    websiteConfigs.push(config)
  }
}
export const removeWebsite = (website: Website) => {
  const index = websites.findIndex(w => w.url === website.url)
  if (index !== -1) {
    websites.splice(index, 1)
  }
  const configIndex = websiteConfigs.findIndex(w => w.url === website.url)
  if (configIndex !== -1) {
    websiteConfigs.splice(configIndex, 1)
  }
}

const findLastIndexByCategory = (category: WebsiteCategory) => {
  for (let i = all_websites.length - 1; i >= 0; i--) {
    if (all_websites[i].category === category) {
      return i
    }
  }
  return -1
}

const findFirstIndexByCategory = (category: WebsiteCategory) => {
  return all_websites.findIndex(site => site.category === category)
}

const resolveInsertionIndex = (category: WebsiteCategory, positionInCategory: number) => {
  if (positionInCategory < 0) {
    positionInCategory = 0
  }

  let seen = 0
  for (let i = 0; i < all_websites.length; i++) {
    if (all_websites[i].category !== category) {
      continue
    }
    if (seen === positionInCategory) {
      return i
    }
    seen++
  }

  const lastIndex = findLastIndexByCategory(category)
  if (lastIndex !== -1) {
    return lastIndex + 1
  }

  const targetCategoryIndex = WEBSITE_CATEGORIES.indexOf(category)

  for (let i = targetCategoryIndex - 1; i >= 0; i--) {
    const prevCategory = WEBSITE_CATEGORIES[i]
    const prevLastIndex = findLastIndexByCategory(prevCategory)
    if (prevLastIndex !== -1) {
      return prevLastIndex + 1
    }
  }

  for (let i = targetCategoryIndex + 1; i < WEBSITE_CATEGORIES.length; i++) {
    const nextCategory = WEBSITE_CATEGORIES[i]
    const nextFirstIndex = findFirstIndexByCategory(nextCategory)
    if (nextFirstIndex !== -1) {
      return nextFirstIndex
    }
  }

  return all_websites.length
}

const syncWebsitesOrder = () => {
  // 获取所有在 websites 中的网站 URL
  const activeUrls = new Set(websites.map(w => w.url))
  
  // 按照 all_websites 的顺序重新排序 websites
  const orderedWebsites = all_websites
    .filter(w => activeUrls.has(w.url))
    .map(w => {
      // 找到对应的网站对象（保持引用）
      return websites.find(ws => ws.url === w.url) || w
    })
  
  // 清空并重新填充 websites，保持响应式
  websites.splice(0, websites.length, ...orderedWebsites)
}

export const moveWebsite = (
  website: Website,
  targetCategory: WebsiteCategory,
  targetIndexInCategory: number
) => {
  const currentIndex = all_websites.findIndex(w => w.url === website.url)
  if (currentIndex === -1) {
    return
  }

  const [movingWebsite] = all_websites.splice(currentIndex, 1)
  movingWebsite.category = targetCategory

  const insertionIndex = resolveInsertionIndex(targetCategory, targetIndexInCategory)
  all_websites.splice(insertionIndex, 0, movingWebsite)
  
  // 同步更新 websites 的顺序
  syncWebsitesOrder()
}

interface AddWebsiteResult {
  success: boolean
  message?: string
}

export const addCustomWebsite = (
  rawUrl: string,
  category: WebsiteCategory,
  selector = 'textarea input div[contenteditable="true"]'
): AddWebsiteResult => {
  const trimmedUrl = rawUrl.trim()
  if (!trimmedUrl) {
    return { success: false, message: '请输入有效的 URL' }
  }
  try {
    new URL(trimmedUrl)
  } catch {
    return { success: false, message: 'URL 格式不正确' }
  }
  const trimmedCategory = category.trim()
  if (!trimmedCategory) {
    return { success: false, message: '请输入有效的分类' }
  }
  const exists = all_websites.some(w => w.url === trimmedUrl)
  if (exists) {
    return { success: false, message: '该网站已存在列表中' }
  }
  // 如果新分类不存在，添加到列表中
  if (!WEBSITE_CATEGORIES.includes(trimmedCategory)) {
    WEBSITE_CATEGORIES.push(trimmedCategory)
  }
  const config: WebsiteConfig = {
    url: trimmedUrl,
    selector,
    category: trimmedCategory
  }
  websiteConfigs.push(config)
  allWebsiteConfigs.push(config)
  console.log(websiteConfigs)
  console.log(allWebsiteConfigs)
  const newWebsiteForList = createWebsite(config)
  all_websites.push(newWebsiteForList)
  refreshNames([newWebsiteForList])
  return { success: true }
}

export const deleteWebsiteFromAll = (website: Website) => {
  const index = all_websites.findIndex(w => w.url === website.url)
  if (index !== -1) {
    all_websites.splice(index, 1)
  }
  const configIndex = allWebsiteConfigs.findIndex(w => w.url === website.url)
  if (configIndex !== -1) {
    allWebsiteConfigs.splice(configIndex, 1)
  }
  // 同时从活跃列表中移除
  const activeIndex = websites.findIndex(w => w.url === website.url)
  if (activeIndex !== -1) {
    websites.splice(activeIndex, 1)
  }
  const activeConfigIndex = websiteConfigs.findIndex(w => w.url === website.url)
  if (activeConfigIndex !== -1) {
    websiteConfigs.splice(activeConfigIndex, 1)
  }
}

// 设置websiteConfigs，如果传入null则使用默认值
export const setWebsiteConfigs = (configs: WebsiteConfig[] | null) => {
  if (configs) {
    websiteConfigs = [...configs]
  } else {
    websiteConfigs = [...defaultWebsiteConfigs]
  }
  // 重新初始化websites数组
  websites.splice(0, websites.length, ...websiteConfigs.map(createWebsite))
  refreshNames(websites)
}

// 设置allWebsiteConfigs，如果传入null则使用默认值
export const setAllWebsiteConfigs = (configs: WebsiteConfig[] | null) => {
  if (configs) {
    allWebsiteConfigs = [...configs]
  } else {
    allWebsiteConfigs = [...defaultAllWebsiteConfigs]
  }
  // 重新初始化all_websites数组
  all_websites.splice(0, all_websites.length, ...allWebsiteConfigs.map(createWebsite))
  refreshNames(all_websites)
}

// 获取当前的websiteConfigs
export const getWebsiteConfigs = (): WebsiteConfig[] => [...websiteConfigs]

// 获取当前的allWebsiteConfigs
export const getAllWebsiteConfigs = (): WebsiteConfig[] => [...allWebsiteConfigs]
