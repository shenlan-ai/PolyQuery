<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import {
  WEBSITE_CATEGORIES,
  all_websites,
  websites,
  addWebsite,
  removeWebsite,
  Website,
  addCustomWebsite,
  WebsiteCategory,
  moveWebsite,
  getWebsiteConfigs,
  deleteWebsiteFromAll
} from '../types/website'
import { Button } from 'ant-design-vue'
import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  collapsed?: boolean
}>()

const emit = defineEmits<{
  selectWebsite: [url: string]
  toggleSidebar: []
}>()

const showAddModal = ref(false)
const newWebsiteUrl = ref('')
const newWebsiteCategory = ref<WebsiteCategory>(WEBSITE_CATEGORIES[0])
const newWebsiteSelector = ref('')
const addWebsiteError = ref('')
const categoryOptions = computed(() => [...new Set(all_websites.map(site => site.category))])

const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const selectedWebsite = ref<Website | null>(null)

const groupedWebsites = computed(() =>
  categoryOptions.value.map(category => ({
    category,
    websites: all_websites.filter(site => site.category === category)
  }))
)

const categoryExpanded = reactive<Record<string, boolean>>({})

const toggleCategory = (category: string) => {
  if (categoryExpanded[category] === undefined) {
    categoryExpanded[category] = false
  } else {
    categoryExpanded[category] = !categoryExpanded[category]
  }
}

// 检查网站是否已在活跃列表中
const isActive = (website: Website) => {
  return websites.some(w => w.url === website.url)
}

const onDoubleClick = (website: Website) => {
  if (isActive(website)){
    removeWebsite(website)
    console.log(getWebsiteConfigs())
  }
  else{addWebsite(website)}
}

const onClick = (website: Website) => {
  // 如果网站已在活跃列表中，则定位到该网页
  if (isActive(website)) {
    // emit('selectWebsite', website.url)
  }
}

const openAddModal = () => {
  newWebsiteUrl.value = ''
  newWebsiteCategory.value = ''
  newWebsiteSelector.value = ''
  addWebsiteError.value = ''
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  addWebsiteError.value = ''
  newWebsiteUrl.value = ''
  newWebsiteCategory.value = ''
  newWebsiteSelector.value = ''
}

const submitAddWebsite = () => {
  addWebsiteError.value = ''
  const selector = newWebsiteSelector.value.trim() || undefined
  const result = addCustomWebsite(newWebsiteUrl.value, newWebsiteCategory.value, selector)
  if (!result.success) {
    addWebsiteError.value = result.message ?? '添加失败'
    return
  }
  newWebsiteUrl.value = ''
  newWebsiteCategory.value = ''
  newWebsiteSelector.value = ''
  showAddModal.value = false
}

const draggedWebsite = ref<Website | null>(null)
const dropCategory = ref<WebsiteCategory | null>(null)
const dropIndex = ref(-1)

const resetDragState = () => {
  draggedWebsite.value = null
  dropCategory.value = null
  dropIndex.value = -1
}

const setDropPosition = (category: WebsiteCategory, index: number) => {
  dropCategory.value = category
  dropIndex.value = index
}

const onDragStart = (website: Website, event: DragEvent) => {
  draggedWebsite.value = website
  event.dataTransfer?.setData('text/plain', website.url)
  if (typeof document !== 'undefined') {
    const ghost = document.createElement('div')
    ghost.style.opacity = '0'
    document.body.appendChild(ghost)
    event.dataTransfer?.setDragImage(ghost, 0, 0)
    requestAnimationFrame(() => document.body.removeChild(ghost))
  }
}

const onDragEnd = () => {
  resetDragState()
}

const onDragOverItem = (category: WebsiteCategory, index: number, event: DragEvent) => {
  event.preventDefault()
  const target = event.currentTarget as HTMLElement | null
  let nextIndex = index

  if (target) {
    const rect = target.getBoundingClientRect()
    const offset = event.clientY - rect.top
    if (offset > rect.height / 2) {
      nextIndex = index + 1
    }
  }

  setDropPosition(category, nextIndex)
}

const findDropContainer = (eventTarget: EventTarget | null): HTMLElement | null => {
  if (!(eventTarget instanceof HTMLElement)) {
    return null
  }
  const categoryContainer = eventTarget.closest('.category-items') as HTMLElement | null
  if (categoryContainer) {
    return categoryContainer
  }
  const emptyContainer = eventTarget.closest('.empty-category') as HTMLElement | null
  return emptyContainer
}

const computeDropIndexFromEvent = (category: WebsiteCategory, event: DragEvent) => {
  const group = groupedWebsites.value.find(g => g.category === category)
  if (!group) {
    return 0
  }
  const container = findDropContainer(event.currentTarget)
  if (!container) {
    return dropIndex.value !== -1 ? dropIndex.value : group.websites.length
  }

  const pointerY = event.clientY
  const items = Array.from(container.querySelectorAll('.list-item')) as HTMLElement[]
  if (!items.length) {
    const rect = container.getBoundingClientRect()
    return pointerY < rect.top + rect.height / 2 ? 0 : 0
  }

  for (let i = 0; i < items.length; i++) {
    const rect = items[i].getBoundingClientRect()
    if (pointerY < rect.top + rect.height / 2) {
      return i
    }
  }

  return items.length
}

const onDragOverCategoryEnd = (category: WebsiteCategory, event: DragEvent) => {
  const index = computeDropIndexFromEvent(category, event)
  setDropPosition(category, index)
}

const handleDrop = (category: WebsiteCategory, event: DragEvent) => {
  if (!draggedWebsite.value) {
    resetDragState()
    return
  }

  const index = computeDropIndexFromEvent(category, event)
  setDropPosition(category, index)
  moveWebsite(draggedWebsite.value, category, index)
  resetDragState()
}

const isDraggingWebsite = (website: Website) => draggedWebsite.value?.url === website.url

const shouldShowIndicator = (category: WebsiteCategory, index: number) =>
  dropCategory.value === category && dropIndex.value === index

const onContextMenu = (website: Website, event: MouseEvent) => {
  event.preventDefault()
  selectedWebsite.value = website
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  showContextMenu.value = true
}

const closeContextMenu = () => {
  showContextMenu.value = false
  selectedWebsite.value = null
}

const deleteSelectedWebsite = () => {
  if (selectedWebsite.value) {
    deleteWebsiteFromAll(selectedWebsite.value)
  }
  closeContextMenu()
}

</script>

<template>
  <div class="websitelist" :class="{ collapsed: props.collapsed }">
    <div class="title">
      <Button
        class="sidebar-toggle"
        :class="{ 'sidebar-collapsed': props.collapsed }"
        shape="circle"
        :aria-label="props.collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="emit('toggleSidebar')"
      >
        <template #icon>
          <RightOutlined v-if="props.collapsed" />
          <LeftOutlined v-else />
        </template>
      </Button>
      <div class="title-label">
        <span class="title-text">Website List</span>
        <Button
          class="add-website-btn"
          shape="circle"
          aria-label="Add website"
          @click="openAddModal"
        >
          <template #icon>
            <PlusOutlined />
          </template>
        </Button>
      </div>
    </div>
    <div class="list">
      <div
        v-for="group in groupedWebsites"
        :key="group.category"
        class="category-group"
      >
        <div class="category-header" @click="toggleCategory(group.category)">
          <div class="category-title">
            <span>{{ group.category }}</span>
            <span class="category-count">{{ group.websites.length }}</span>
          </div>
          <div class="category-divider"></div>
        </div>
        <div
          v-if="group.websites.length"
          v-show="categoryExpanded[group.category] !== false"
          class="category-items"
          :class="{ 'is-drop-target': dropCategory === group.category }"
          @dragover.prevent="event => onDragOverCategoryEnd(group.category, event)"
          @drop.prevent="event => handleDrop(group.category, event)"
        >
          <template v-for="(website, websiteIndex) in group.websites" :key="website.url">
            <div
              v-if="shouldShowIndicator(group.category, websiteIndex)"
              class="drop-indicator"
            ></div>
            <div
              class="list-item"
              :class="{ added: isActive(website), dragging: isDraggingWebsite(website) }"
              draggable="true"
              @dragstart="onDragStart(website, $event)"
              @dragend="onDragEnd"
              @dragover.prevent="onDragOverItem(group.category, websiteIndex, $event)"
              @drop.prevent="event => handleDrop(group.category, event)"
              @dblclick="onDoubleClick(website)"
              @click="onClick(website)"
              @contextmenu="onContextMenu(website, $event)"
            >
              <div class="content">
                <div class="item-header">
                  <div class="name">{{ website.name }}</div>
                  <!-- <div class="category-chip" :class="getCategoryClass(website.category)">
                    {{ website.category }}
                  </div> -->
                </div>
                <div class="url">{{ website.url }}</div>
              </div>
              <div v-if="isActive(website)" class="added-indicator">✅</div>
            </div>
          </template>
          <div
            v-if="shouldShowIndicator(group.category, group.websites.length)"
            class="drop-indicator"
          ></div>
        </div>
        <div
          v-else
          v-show="categoryExpanded[group.category] !== false"
          class="empty-category"
          :class="{ 'is-drop-target': dropCategory === group.category }"
          @dragover.prevent="event => onDragOverCategoryEnd(group.category, event)"
          @drop.prevent="event => handleDrop(group.category, event)"
        >
          Websites of this category have not been added yet
        </div>
      </div>
    </div>
    <div
      v-if="showAddModal"
      class="modal-overlay"
      @click.self="closeAddModal"
    >
      <form class="modal-content" @submit.prevent="submitAddWebsite">
        <h3>add website</h3>
        <label class="modal-label">
          Website URL
          <input
            v-model="newWebsiteUrl"
            type="text"
            class="modal-input"
            placeholder="https://example.com"
            autocomplete="off"
          />
        </label>
        <label class="modal-label">
          select category
          <input
            v-model="newWebsiteCategory"
            type="text"
            class="modal-input"
            list="categories"
            placeholder="Choose or enter a new category"
          />
          <datalist id="categories">
            <option v-for="category in categoryOptions" :key="category" :value="category"></option>
          </datalist>
        </label>
        <label class="modal-label">
          Selector(optional)
          <input
            v-model="newWebsiteSelector"
            type="text"
            class="modal-input"
            placeholder="textarea input div[contenteditable='true']"
            autocomplete="off"
          />
        </label>
        <p v-if="addWebsiteError" class="error-text">{{ addWebsiteError }}</p>
        <div class="modal-actions">
          <button type="button" class="modal-btn secondary" @click="closeAddModal">cancel</button>
          <button type="submit" class="modal-btn primary">add</button>
        </div>
      </form>
    </div>
    <!-- 右键菜单 -->
    <div
      v-if="showContextMenu"
      class="context-menu"
      :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
      @click.stop
    >
      <div class="context-menu-item" @click="deleteSelectedWebsite">
        delete website
      </div>
    </div>
    <!-- 点击其他地方关闭右键菜单 -->
    <div
      v-if="showContextMenu"
      class="context-menu-overlay"
      @click="closeContextMenu"
    ></div>
  </div>
</template>



<style scoped>
.websitelist {
  width: 280px;
  height: 100vh;
  background: #faf9f6;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.2s ease;
  flex-shrink: 0;
}

.title {
  min-height: 80px;
  padding: 20px 24px;
  padding-left: 60px; 
  font-size: 30px;
  font-weight: 500;
  color: #1a1a1a;
  background: #faf9f6;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-family: "Georgia", "Times New Roman", "Times", serif;
  position: relative;
}

.title-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.title-text {
  font-size: 25px;
  font-weight: 700;
  display: inline-block;
  white-space: nowrap;
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 80px 20px;
  background: #faf9f6;
}

/* 自定义垂直滚动条样式 */
.list::-webkit-scrollbar {
  width: 10px;
}

.list::-webkit-scrollbar-track {
  background: rgba(250, 249, 246, 0.8);
  border-radius: 10px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.list::-webkit-scrollbar-thumb {
  background: #4d4d4d;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transform: scaleX(1.1);
}

.list::-webkit-scrollbar-thumb:active {
  background: linear-gradient(135deg, #4c51bf 0%, #553c9a 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.category-group {
  margin-bottom: 28px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}

.category-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.category-count {
  min-width: 26px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #e5e7eb;
  color: #374151;
  font-size: 12px;
  text-align: center;
}

.category-divider {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.2), rgba(148, 163, 184, 0.05));
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-category {
  font-size: 13px;
  color: #94a3b8;
  font-style: italic;
  margin-left: 4px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.list-item:hover {
  background: #f3f4f6;
  border-color: #e5e7eb;
  transform: translateX(2px);
}

.list-item.active {
  background: #f0f4ff;
  border-color: #6366f1;
  border-left: 3px solid #6366f1;
}

.list-item.added {
  background: #f0fdf4;
  border-color: #86efac;
}
.list-item.dragging {
  opacity: 0.5;
  border-style: dashed;
}

.category-items.is-drop-target {
  outline: 2px dashed #c7d2fe;
  outline-offset: 6px;
  border-radius: 12px;
}

.empty-category.is-drop-target {
  outline: 2px dashed #c7d2fe;
  outline-offset: 6px;
  border-radius: 12px;
  padding: 8px;
}

.drop-indicator {
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, #c7d2fe, #a78bfa);
  margin: 4px 0;
  transition: opacity 0.2s ease;
}

.sidebar-toggle {
  position: fixed;
  top: 20px;
  left: 8px;
  width: 40px;
  height: 40px;
  border: 2px solid #000000 !important;
  background: #ffffff !important;
  color: #000000 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  z-index: 200;
  box-shadow: none !important;
}

.sidebar-toggle:hover {
  border-color: #000000 !important;
  background: #f5f5f5 !important;
  color: #000000 !important;
}

.sidebar-toggle:active {
  background: #e8e8e8 !important;
}

.add-website-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #000000 !important;
  background: #ffffff !important;
  color: #000000 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.add-website-btn:hover {
  border-color: #000000 !important;
  background: #f5f5f5 !important;
  color: #000000 !important;
  transform: translateY(-1px);
}

.add-website-btn:active {
  background: #e8e8e8 !important;
}

.websitelist.collapsed {
  width: 0;
  border-right: none;
  background: transparent;
  box-shadow: none;
}

.websitelist.collapsed .title-text,
.websitelist.collapsed .list,
.websitelist.collapsed .list-item .content,
.websitelist.collapsed .list-item .added-indicator {
  display: none;
}

.added-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #10b981;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: bold;
  font-size: 10px;
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.3);
}

.website-favicon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  margin-right: 12px;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
}

.content {
  flex: 1;
  overflow: hidden;
}

.website-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 12px;
  display: inline-block;
  vertical-align: middle;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  font-family: "Georgia", "Times New Roman", "Times", serif;
}

.url {
  font-size: 12px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-chip {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: #f3f4f6;
  color: #4b5563;
  white-space: nowrap;
}

.accent-ai {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #4338ca;
}

.accent-data {
  background: #ecfdf5;
  border-color: #bbf7d0;
  color: #047857;
}

.accent-tech {
  background: #e0f2fe;
  border-color: #bae6fd;
  color: #0369a1;
}

.accent-academic {
  background: #fef3c7;
  border-color: #fde68a;
  color: #92400e;
}

.accent-social {
  background: #fce7f3;
  border-color: #f9a8d4;
  color: #9d174d;
}

.accent-default {
  background: #e5e7eb;
  border-color: #d1d5db;
  color: #374151;
}

.websocket-status {
  position: absolute;
  bottom: 8px;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  opacity: 0.7;
}

.added .websocket-status {
  background: #6366f1;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
}

.modal-content {
  width: 360px;
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-content h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.modal-label {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #4b5563;
  gap: 8px;
}

.modal-input {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  transition: border 0.2s ease;
}

.modal-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.modal-select {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  color: #111827;
  background: #ffffff;
  outline: none;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.modal-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.error-text {
  color: #dc2626;
  font-size: 13px;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-btn {
  min-width: 80px;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.modal-btn.secondary {
  background: #e5e7eb;
  color: #374151;
}

.modal-btn.primary {
  background: #4f46e5;
  color: #ffffff;
}

.modal-btn.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.context-menu {
  position: fixed;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
  padding: 4px 0;
}

.context-menu-item {
  padding: 8px 16px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.context-menu-item:hover {
  background-color: #f3f4f6;
}

.context-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}
</style>
