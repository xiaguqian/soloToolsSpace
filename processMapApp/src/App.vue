<template>
  <div class="app-container" :data-theme="isDark ? 'dark' : 'light'">
    <TopToolbar
      :can-undo="canUndo"
      :can-redo="canRedo"
      :auto-save-enabled="autoSaveEnabled"
      :is-dark="isDark"
      :is-saved="isSaved"
      :is-saving="isSaving"
      :cache-path="cachePath"
      @undo="handleUndo"
      @redo="handleRedo"
      @copy="handleCopy"
      @paste="handlePaste"
      @delete="handleDelete"
      @clear="handleClear"
      @fit-view="handleFitView"
      @toggle-auto-save="autoSaveEnabled = !autoSaveEnabled"
      @save-draft="handleSaveDraft"
      @set-cache-path="handleSetCachePath"
      @import="handleImport"
      @toggle-theme="isDark = !isDark"
      @export="handleExport"
    />
    
    <div class="main-content">
      <LeftSidebar
        :collapsed="leftCollapsed"
        @toggle="leftCollapsed = !leftCollapsed"
        @load-example="loadExampleFlow"
      />
      
      <FlowCanvas
        ref="canvasRef"
        :nodes="nodes"
        :edges="edges"
        :show-grid="showGrid"
        :grid-size="gridSize"
        @add-node="handleAddNode"
        @add-edge="handleAddEdge"
        @nodes-change="onNodesChange"
        @edges-change="onEdgesChange"
        @viewport-change="onViewportChange"
      />
      
      <RightSidebar
        :collapsed="rightCollapsed"
        v-model:show-grid="showGrid"
        v-model:grid-size="gridSize"
        @toggle="rightCollapsed = !rightCollapsed"
        @delete-selected="handleDelete"
      />
    </div>
    
    <input
      ref="fileInput"
      type="file"
      accept=".vfd,.json"
      style="display: none"
      @change="handleFileSelect"
    />
    
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ modalTitle }}</h3>
        <p>{{ modalMessage }}</p>
        <div class="modal-actions">
          <button v-if="showConfirm" class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn" :class="confirmType === 'danger' ? 'btn-danger' : 'btn-primary'" @click="confirmModal">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="showCachePathModal" class="modal-overlay" @click.self="showCachePathModal = false">
      <div class="modal-content cache-modal">
        <h3>草稿缓存设置</h3>
        <div class="current-path">
          <label>当前缓存路径:</label>
          <span>{{ cachePath || '未设置 (默认: 浏览器本地存储)' }}</span>
        </div>
        <div class="cache-actions">
          <button class="btn btn-primary" @click="selectDirectory" :disabled="!supportsDirectoryPicker">
            📁 选择本地文件夹
          </button>
          <span v-if="!supportsDirectoryPicker" class="hint">
            浏览器不支持文件夹选择，将使用浏览器本地存储
          </span>
        </div>
        <div v-if="savedDrafts.length > 0" class="drafts-list">
          <h4>已保存的草稿</h4>
          <ul>
            <li v-for="draft in savedDrafts" :key="draft.name">
              <span class="draft-name">{{ draft.name }}</span>
              <span class="draft-date">{{ formatDate(draft.modified) }}</span>
              <div class="draft-actions">
                <button @click="loadDraft(draft)">加载</button>
                <button class="danger" @click="deleteDraft(draft)">删除</button>
              </div>
            </li>
          </ul>
        </div>
        <button class="btn btn-secondary close-btn" @click="showCachePathModal = false">关闭</button>
      </div>
    </div>
    
    <div v-if="showToast" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import TopToolbar from './components/TopToolbar.vue'
import LeftSidebar from './components/LeftSidebar.vue'
import FlowCanvas from './components/FlowCanvas.vue'
import RightSidebar from './components/RightSidebar.vue'
import { applyNodeChanges, applyEdgeChanges } from '@vue-flow/core'
import { generateId, exportAsJSON, importFromJSON, downloadFile, readFileAsText, formatDate } from './utils/helpers.js'
import { exampleFlows, addExampleEdges } from './utils/examples.js'

const canvasRef = ref(null)
const fileInput = ref(null)

const nodes = ref([])
const edges = ref([])
const viewport = ref({ x: 0, y: 0, zoom: 1 })

const showGrid = ref(true)
const gridSize = ref(20)
const leftCollapsed = ref(false)
const rightCollapsed = ref(false)
const isDark = ref(false)

const history = ref([])
const historyIndex = ref(-1)
const maxHistory = 20
const isHistoryAction = ref(false)

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const copiedItems = ref({ nodes: [], edges: [] })

const autoSaveEnabled = ref(true)
const autoSaveInterval = ref(5 * 60 * 1000)
const autoSaveTimer = ref(null)
const isSaving = ref(false)
const lastSavedState = ref(null)

const isSaved = computed(() => {
  if (!lastSavedState.value) return false
  const currentState = JSON.stringify({ nodes: nodes.value, edges: edges.value })
  return currentState === lastSavedState.value
})

const supportsDirectoryPicker = computed(() => 
  'showDirectoryPicker' in window
)

const cachePath = ref('')
const directoryHandle = ref(null)
const savedDrafts = ref([])

const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const showConfirm = ref(false)
const confirmText = ref('确定')
const confirmType = ref('primary')
let modalCallback = null

const showCachePathModal = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('info')

const saveToHistory = () => {
  if (isHistoryAction.value) return
  
  const state = {
    nodes: JSON.parse(JSON.stringify(nodes.value)),
    edges: JSON.parse(JSON.stringify(edges.value))
  }
  
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(state)
  
  if (history.value.length > maxHistory) {
    history.value.shift()
  } else {
    historyIndex.value++
  }
}

const handleUndo = () => {
  if (!canUndo.value) return
  isHistoryAction.value = true
  historyIndex.value--
  const state = history.value[historyIndex.value]
  nodes.value = JSON.parse(JSON.stringify(state.nodes))
  edges.value = JSON.parse(JSON.stringify(state.edges))
  isHistoryAction.value = false
}

const handleRedo = () => {
  if (!canRedo.value) return
  isHistoryAction.value = true
  historyIndex.value++
  const state = history.value[historyIndex.value]
  nodes.value = JSON.parse(JSON.stringify(state.nodes))
  edges.value = JSON.parse(JSON.stringify(state.edges))
  isHistoryAction.value = false
}

const onNodesChange = (changes) => {
  console.log('onNodesChange:', changes)
  nodes.value = applyNodeChanges(changes, nodes.value)
  saveToHistory()
}

const onEdgesChange = (changes) => {
  console.log('onEdgesChange:', changes)
  edges.value = applyEdgeChanges(changes, edges.value)
  saveToHistory()
}

const onViewportChange = (vp) => {
  viewport.value = vp
}

const handleAddNode = (node) => {
  console.log('Adding node:', node)
  nodes.value = [...nodes.value, node]
  saveToHistory()
}

const handleAddEdge = (edge) => {
  console.log('Adding edge:', edge)
  edges.value = [...edges.value, edge]
  saveToHistory()
}

const handleCopy = async () => {
  if (window.getSelection && window.getSelection().type === 'Range') return
  
  const selectedNodes = nodes.value.filter(n => n.selected)
  const selectedEdges = edges.value.filter(e => e.selected)
  
  if (selectedNodes.length === 0) return
  
  copiedItems.value = {
    nodes: selectedNodes.map(n => ({ ...n, id: generateId() })),
    edges: selectedEdges.map(e => ({ ...e, id: generateId() }))
  }
  
  try {
    await navigator.clipboard.writeText(JSON.stringify(copiedItems.value))
  } catch (e) {
  }
  
  showToastMessage('已复制选中内容', 'info')
}

const handlePaste = async () => {
  if (window.getSelection && window.getSelection().type === 'Range') return
  
  let items = copiedItems.value
  
  try {
    const text = await navigator.clipboard.readText()
    const parsed = JSON.parse(text)
    if (parsed.nodes && Array.isArray(parsed.nodes)) {
      items = parsed
    }
  } catch (e) {
  }
  
  if (items.nodes.length === 0) return
  
  const offsetX = 30
  const offsetY = 30
  
  const newNodes = items.nodes.map(n => ({
    ...n,
    id: generateId(),
    position: {
      x: n.position.x + offsetX,
      y: n.position.y + offsetY
    }
  }))
  
  const idMap = {}
  items.nodes.forEach((oldNode, idx) => {
    idMap[oldNode.id] = newNodes[idx].id
  })
  
  const newEdges = items.edges.map(e => ({
    ...e,
    id: generateId(),
    source: idMap[e.source] || e.source,
    target: idMap[e.target] || e.target
  }))
  
  nodes.value = [...nodes.value, ...newNodes]
  edges.value = [...edges.value, ...newEdges]
  
  saveToHistory()
  showToastMessage('已粘贴内容', 'info')
}

const handleDelete = () => {
  if (window.getSelection && window.getSelection().type === 'Range') return
  
  const hasSelection = nodes.value.some(n => n.selected) || edges.value.some(e => e.selected)
  if (!hasSelection) return
  
  nodes.value = nodes.value.filter(n => !n.selected)
  edges.value = edges.value.filter(e => !e.selected)
  
  saveToHistory()
}

const handleClear = () => {
  if (nodes.value.length === 0 && edges.value.length === 0) return
  
  showConfirmModal(
    '确认清空',
    '确定要清空所有节点和连线吗？此操作无法撤销。',
    'danger',
    () => {
      nodes.value = []
      edges.value = []
      saveToHistory()
      showToastMessage('画布已清空', 'info')
    }
  )
}

const handleFitView = () => {
  canvasRef.value?.fitView()
}

const loadExampleFlow = (example) => {
  if (nodes.value.length > 0) {
    showConfirmModal(
      '加载示例',
      '加载示例将替换当前画布内容，是否继续？',
      'primary',
      () => {
        const exampleNodes = JSON.parse(JSON.stringify(example.data.nodes))
        const exampleEdges = addExampleEdges(exampleNodes)
        nodes.value = exampleNodes
        edges.value = exampleEdges
        saveToHistory()
        setTimeout(() => handleFitView(), 100)
        showToastMessage(`已加载示例: ${example.name}`, 'success')
      }
    )
  } else {
    const exampleNodes = JSON.parse(JSON.stringify(example.data.nodes))
    const exampleEdges = addExampleEdges(exampleNodes)
    nodes.value = exampleNodes
    edges.value = exampleEdges
    saveToHistory()
    setTimeout(() => handleFitView(), 100)
    showToastMessage(`已加载示例: ${example.name}`, 'success')
  }
}

const handleExport = async (format) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  
  if (format === 'vfd') {
    const data = exportAsJSON(nodes.value, edges.value, viewport.value)
    downloadFile(JSON.stringify(data, null, 2), `flow-${timestamp}.vfd`, 'application/json')
    showToastMessage('已导出为 .vfd 文件', 'success')
    return
  }
  
  try {
    let dataUrl, extension, mimeType
    
    if (format === 'png') {
      dataUrl = await canvasRef.value.exportAsImage('png')
      extension = 'png'
      mimeType = 'image/png'
    } else if (format === 'jpg') {
      dataUrl = await canvasRef.value.exportAsImage('jpg')
      extension = 'jpg'
      mimeType = 'image/jpeg'
    } else if (format === 'svg') {
      dataUrl = await canvasRef.value.exportAsImage('svg')
      extension = 'svg'
      mimeType = 'image/svg+xml'
    }
    
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `flow-${timestamp}.${extension}`
    link.click()
    showToastMessage(`已导出为 ${extension.toUpperCase()} 图片`, 'success')
  } catch (error) {
    console.error('Export error:', error)
    showToastMessage('导出失败，请重试', 'error')
  }
}

const handleImport = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  if (nodes.value.length > 0) {
    showConfirmModal(
      '导入文件',
      '导入将替换当前画布内容，是否继续？',
      'primary',
      () => importFile(file)
    )
  } else {
    await importFile(file)
  }
  
  event.target.value = ''
}

const importFile = async (file) => {
  try {
    const text = await readFileAsText(file)
    const json = JSON.parse(text)
    const data = importFromJSON(json)
    
    nodes.value = data.nodes
    edges.value = data.edges
    viewport.value = data.viewport
    saveToHistory()
    showToastMessage('导入成功', 'success')
  } catch (error) {
    console.error('Import error:', error)
    showToastMessage('导入失败：文件格式错误', 'error')
  }
}

const getLocalStorageDrafts = () => {
  const drafts = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('flow_draft_')) {
      try {
        const item = JSON.parse(localStorage.getItem(key))
        drafts.push({
          name: key.replace('flow_draft_', ''),
          modified: item.modified,
          data: item.data,
          source: 'localStorage'
        })
      } catch (e) {
      }
    }
  }
  return drafts.sort((a, b) => new Date(b.modified) - new Date(a.modified))
}

const loadDirectoryDrafts = async () => {
  if (!directoryHandle.value) return []
  
  const drafts = []
  for await (const entry of directoryHandle.value.values()) {
    if (entry.kind === 'file' && entry.name.endsWith('.vfd')) {
      try {
        const file = await entry.getFile()
        const text = await readFileAsText(file)
        drafts.push({
          name: entry.name.replace('.vfd', ''),
          modified: file.lastModified,
          data: text,
          handle: entry,
          source: 'directory'
        })
      } catch (e) {
      }
    }
  }
  return drafts.sort((a, b) => new Date(b.modified) - new Date(a.modified))
}

const refreshDrafts = async () => {
  if (directoryHandle.value) {
    savedDrafts.value = await loadDirectoryDrafts()
  } else {
    savedDrafts.value = getLocalStorageDrafts()
  }
}

const handleSetCachePath = async () => {
  await refreshDrafts()
  showCachePathModal.value = true
}

const selectDirectory = async () => {
  try {
    directoryHandle.value = await window.showDirectoryPicker({ mode: 'readwrite' })
    cachePath.value = directoryHandle.value.name
    await refreshDrafts()
    showToastMessage(`已选择缓存路径: ${directoryHandle.value.name}`, 'success')
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Directory picker error:', error)
      showToastMessage('无法访问文件夹，将使用浏览器本地存储', 'error')
    }
  }
}

const getCurrentFlowData = () => {
  return JSON.stringify(exportAsJSON(nodes.value, edges.value, viewport.value), null, 2)
}

const saveToLocalStorage = (name) => {
  const data = {
    modified: new Date().toISOString(),
    data: getCurrentFlowData()
  }
  localStorage.setItem(`flow_draft_${name}`, JSON.stringify(data))
}

const saveToDirectory = async (name) => {
  if (!directoryHandle.value) return
  
  const fileName = name.endsWith('.vfd') ? name : `${name}.vfd`
  const fileHandle = await directoryHandle.value.getFileHandle(fileName, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(getCurrentFlowData())
  await writable.close()
}

const handleSaveDraft = async () => {
  if (nodes.value.length === 0) {
    showToastMessage('画布为空，无需保存', 'warning')
    return
  }
  
  isSaving.value = true
  
  try {
    const name = `flow_${new Date().toISOString().slice(0, 10)}`
    
    if (directoryHandle.value) {
      await saveToDirectory(name)
    } else {
      saveToLocalStorage(name)
    }
    
    lastSavedState.value = JSON.stringify({ nodes: nodes.value, edges: edges.value })
    showToastMessage('草稿已保存', 'success')
  } catch (error) {
    console.error('Save error:', error)
    showToastMessage('保存失败，请重试', 'error')
  } finally {
    isSaving.value = false
  }
}

const loadDraft = async (draft) => {
  try {
    let json
    
    if (draft.source === 'localStorage') {
      const item = JSON.parse(draft.data)
      json = JSON.parse(item.data)
    } else if (draft.source === 'directory') {
      const file = await draft.handle.getFile()
      const text = await readFileAsText(file)
      json = JSON.parse(text)
    }
    
    const data = importFromJSON(json)
    nodes.value = data.nodes
    edges.value = data.edges
    viewport.value = data.viewport
    saveToHistory()
    showCachePathModal.value = false
    setTimeout(() => handleFitView(), 100)
    showToastMessage(`已加载: ${draft.name}`, 'success')
  } catch (error) {
    console.error('Load draft error:', error)
    showToastMessage('加载失败', 'error')
  }
}

const deleteDraft = (draft) => {
  showConfirmModal(
    '删除草稿',
    `确定要删除草稿 "${draft.name}" 吗？`,
    'danger',
    async () => {
      try {
        if (draft.source === 'localStorage') {
          localStorage.removeItem(`flow_draft_${draft.name}`)
        } else if (draft.source === 'directory' && draft.handle) {
          await directoryHandle.value.removeEntry(draft.handle.name)
        }
        await refreshDrafts()
        showToastMessage('草稿已删除', 'success')
      } catch (error) {
        console.error('Delete draft error:', error)
        showToastMessage('删除失败', 'error')
      }
    }
  )
}

const showConfirmModal = (title, message, type, callback) => {
  modalTitle.value = title
  modalMessage.value = message
  showConfirm.value = true
  confirmText.value = type === 'danger' ? '删除' : '确定'
  confirmType.value = type
  modalCallback = callback
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  modalCallback = null
}

const confirmModal = () => {
  if (modalCallback) {
    modalCallback()
  }
  closeModal()
}

const showToastMessage = (message, type = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const handleKeydown = (event) => {
  const isInput = ['INPUT', 'TEXTAREA'].includes(event.target.tagName)
  
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'z':
        if (!isInput) {
          event.preventDefault()
          if (event.shiftKey) {
            handleRedo()
          } else {
            handleUndo()
          }
        }
        break
      case 'y':
        if (!isInput) {
          event.preventDefault()
          handleRedo()
        }
        break
      case 'c':
        if (!isInput && !window.getSelection().toString()) {
          event.preventDefault()
          handleCopy()
        }
        break
      case 'v':
        if (!isInput) {
          handlePaste()
        }
        break
      case 's':
        event.preventDefault()
        handleSaveDraft()
        break
    }
  }
  
  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (!isInput && !window.getSelection().toString()) {
      handleDelete()
    }
  }
}

const handleBeforeUnload = (event) => {
  if (!isSaved.value && (nodes.value.length > 0 || edges.value.length > 0)) {
    event.preventDefault()
    event.returnValue = '您有未保存的更改，确定要离开吗？'
    return event.returnValue
  }
}

watch(autoSaveEnabled, (enabled) => {
  if (enabled) {
    autoSaveTimer.value = setInterval(() => {
      if (nodes.value.length > 0 && !isSaved.value) {
        handleSaveDraft()
      }
    }, autoSaveInterval.value)
  } else if (autoSaveTimer.value) {
    clearInterval(autoSaveTimer.value)
    autoSaveTimer.value = null
  }
}, { immediate: true })

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  saveToHistory()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  
  if (autoSaveTimer.value) {
    clearInterval(autoSaveTimer.value)
  }
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--sidebar-bg);
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: var(--shadow-lg);
}

.modal-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-color);
}

.modal-content p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--border-color);
  color: var(--text-color);
}

.btn-secondary:hover {
  background: #cbd5e1;
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.cache-modal {
  max-width: 500px;
}

.current-path {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--background-color);
  border-radius: 8px;
  font-size: 13px;
}

.current-path label {
  display: block;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.current-path span {
  color: var(--text-color);
  font-weight: 500;
  word-break: break-all;
}

.cache-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.cache-actions .hint {
  font-size: 12px;
  color: var(--warning-color);
}

.drafts-list {
  margin-bottom: 16px;
}

.drafts-list h4 {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 10px;
}

.drafts-list ul {
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.drafts-list li {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-color);
  gap: 12px;
}

.drafts-list li:last-child {
  border-bottom: none;
}

.draft-name {
  flex: 1;
  font-size: 14px;
  color: var(--text-color);
}

.draft-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.draft-actions {
  display: flex;
  gap: 8px;
}

.draft-actions button {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  background: var(--border-color);
  color: var(--text-color);
}

.draft-actions button:hover {
  background: var(--primary-color);
  color: white;
}

.draft-actions button.danger:hover {
  background: var(--danger-color);
}

.close-btn {
  width: 100%;
  margin-top: 8px;
}

.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  z-index: 2000;
  animation: slideUp 0.3s ease;
}

.toast.info {
  background: var(--primary-color);
  color: white;
}

.toast.success {
  background: var(--success-color);
  color: white;
}

.toast.error {
  background: var(--danger-color);
  color: white;
}

.toast.warning {
  background: var(--warning-color);
  color: white;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
