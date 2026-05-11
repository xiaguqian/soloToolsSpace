<template>
  <div class="directory-manager">
    <div class="header">
      <div class="header-left">
        <h3>常用目录</h3>
        <el-select 
          v-model="currentSetId" 
          style="width: 200px; margin-left: 16px;"
          @change="handleSetChange"
        >
          <el-option
            v-for="set in sets"
            :key="set.id"
            :label="set.name"
            :value="set.id"
          />
        </el-select>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showAddDialog = true" :icon="Plus">
          添加目录
        </el-button>
        <el-button @click="handleDropHint" :icon="Upload">
          拖拽添加
        </el-button>
      </div>
    </div>

    <div 
      class="content-area"
      @dragover.prevent
      @dragenter="isDragOver = true"
      @dragleave="isDragOver = false"
      @drop.prevent="handleDrop"
      :class="{ 'drag-over': isDragOver }"
    >
      <div v-if="isDragOver" class="drag-hint">
        <el-icon :size="64" style="margin-bottom: 16px;"><Upload /></el-icon>
        <p>松开鼠标添加目录</p>
      </div>

      <template v-else-if="groupedItems.length > 0">
        <div v-for="group in groupedItems" :key="group.tag" class="tag-group">
          <div class="tag-header">
            <span class="tag-label">{{ group.tag || '未分类' }}</span>
            <span class="tag-count">{{ group.items.length }} 个目录</span>
          </div>
          <div class="item-grid">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="dir-card"
              @click="handleOpenDir(item)"
              @contextmenu.prevent="showContextMenu(item, $event)"
            >
              <div class="card-icon">📁</div>
              <div class="card-info">
                <div class="card-title" :title="item.alias || item.name">{{ item.alias || item.name }}</div>
                <div class="card-path" :title="item.path">{{ item.path }}</div>
                <div v-if="item.description" class="card-desc" :title="item.description">
                  {{ item.description }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="empty-state">
        <el-icon :size="64" style="margin-bottom: 16px; color: #c0c4cc;"><Folder /></el-icon>
        <p>暂无常用目录，点击上方按钮添加或拖拽文件夹到此处</p>
      </div>
    </div>

    <el-dialog v-model="showAddDialog" title="添加常用目录" width="500px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="选择目录">
          <div class="path-input">
            <el-input v-model="addForm.path" placeholder="选择或拖拽目录" readonly />
            <el-button @click="selectDirectory">浏览</el-button>
          </div>
        </el-form-item>
        <el-form-item label="别名">
          <el-input v-model="addForm.alias" placeholder="留空则使用目录名称" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="addForm.tag" placeholder="选择或输入标签" allow-create filterable>
            <el-option
              v-for="tag in allTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="addForm.description" type="textarea" :rows="3" placeholder="简单说明目录用途" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddItem">添加</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="编辑目录信息" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="路径">
          <el-input v-model="editForm.path" readonly />
        </el-form-item>
        <el-form-item label="别名">
          <el-input v-model="editForm.alias" placeholder="留空则使用目录名称" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="editForm.tag" placeholder="选择或输入标签" allow-create filterable>
            <el-option
              v-for="tag in allTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="简单说明目录用途" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleEditItem">保存</el-button>
      </template>
    </el-dialog>

    <div v-show="showMenu" class="context-menu" :style="menuStyle">
      <div class="menu-item" @click="openInExplorer">
        <span>📂</span> 在资源管理器中打开
      </div>
      <div class="menu-item" @click="copyAbsolutePath">
        <span>📋</span> 复制绝对路径
      </div>
      <div class="menu-item" @click="copyRelativePath">
        <span>📋</span> 复制相对路径
      </div>
      <div class="menu-item" @click="openEditDialog">
        <span>✏️</span> 编辑信息
      </div>
      <div class="menu-item danger" @click="handleDelete">
        <span>🗑️</span> 移除
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from '../store'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Folder } from '@element-plus/icons-vue'

const store = useStore()
const currentSetId = ref('')
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showMenu = ref(false)
const menuPos = ref({ x: 0, y: 0 })
const selectedItem = ref(null)
const isDragOver = ref(false)

const addForm = ref({
  path: '',
  alias: '',
  tag: '',
  description: ''
})

const editForm = ref({
  id: '',
  path: '',
  alias: '',
  tag: '',
  description: ''
})

const sets = computed(() => store.state.config?.directorySets || [])
const currentSet = computed(() => store.getDirectorySet(currentSetId.value))
const items = computed(() => currentSet.value?.items || [])

const allTags = computed(() => {
  const tags = new Set()
  items.value.forEach(item => {
    if (item.tag) tags.add(item.tag)
  })
  return Array.from(tags)
})

const groupedItems = computed(() => {
  const groups = {}
  items.value.forEach(item => {
    const tag = item.tag || ''
    if (!groups[tag]) {
      groups[tag] = { tag: item.tag || '未分类', items: [] }
    }
    groups[tag].items.push(item)
  })
  return Object.values(groups)
})

const menuStyle = computed(() => ({
  left: `${menuPos.value.x}px`,
  top: `${menuPos.value.y}px`
}))

watch(() => store.state.currentDirectorySetId, (val) => {
  if (val) currentSetId.value = val
})

onMounted(() => {
  if (store.state.currentDirectorySetId) {
    currentSetId.value = store.state.currentDirectorySetId
  }
})

function handleSetChange(val) {
  store.setCurrentDirectorySetId(val)
  store.incrementDirectorySetUsage(val)
}

function handleDropHint() {
  ElMessage.info('将外部目录拖拽到列表区域即可添加')
}

async function handleDrop(e) {
  isDragOver.value = false
  if (!e.dataTransfer?.files?.length) return
  
  for (const file of e.dataTransfer.files) {
    if (file.type === '' || file.type === 'application/x-folder') {
      const pathInfo = await window.electronAPI.getPathInfo(file.path)
      if (pathInfo.success) {
        const stat = await window.electronAPI.statPath(file.path)
        if (stat.success && stat.isDirectory) {
          const newItem = {
            id: `dir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            path: file.path,
            name: pathInfo.name,
            alias: '',
            tag: '',
            description: '',
            createdAt: new Date().toISOString()
          }
          await store.addDirectoryItem(currentSetId.value, newItem)
          ElMessage.success(`已添加目录: ${pathInfo.name}`)
        }
      }
    }
  }
}

async function selectDirectory() {
  const dir = await window.electronAPI.selectDirectory()
  if (dir) {
    addForm.value.path = dir
    const pathInfo = await window.electronAPI.getPathInfo(dir)
    if (pathInfo.success) {
      addForm.value.alias = pathInfo.name
    }
  }
}

async function handleAddItem() {
  if (!addForm.value.path) {
    ElMessage.warning('请选择目录')
    return
  }
  
  const pathInfo = await window.electronAPI.getPathInfo(addForm.value.path)
  if (!pathInfo.success) {
    ElMessage.error('路径无效')
    return
  }
  
  const newItem = {
    id: `dir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    path: addForm.value.path,
    name: pathInfo.name,
    alias: addForm.value.alias || '',
    tag: addForm.value.tag || '',
    description: addForm.value.description || '',
    createdAt: new Date().toISOString()
  }
  
  await store.addDirectoryItem(currentSetId.value, newItem)
  ElMessage.success('添加成功')
  showAddDialog.value = false
  resetAddForm()
}

function resetAddForm() {
  addForm.value = {
    path: '',
    alias: '',
    tag: '',
    description: ''
  }
}

function showContextMenu(item, event) {
  selectedItem.value = item
  menuPos.value = { x: event.clientX, y: event.clientY }
  showMenu.value = true
  
  setTimeout(() => {
    document.addEventListener('click', closeMenu, { once: true })
  }, 0)
}

function closeMenu() {
  showMenu.value = false
}

async function handleOpenDir(item) {
  if (window.electronAPI) {
    await window.electronAPI.openDirectory(item.path)
    store.incrementDirectoryItemUsage(item.id)
  }
}

async function openInExplorer() {
  if (selectedItem.value && window.electronAPI) {
    await window.electronAPI.openFileExplorer(selectedItem.value.path)
  }
  closeMenu()
}

function copyAbsolutePath() {
  if (selectedItem.value) {
    navigator.clipboard.writeText(selectedItem.value.path)
    ElMessage.success('已复制绝对路径')
  }
  closeMenu()
}

async function copyRelativePath() {
  if (selectedItem.value && window.electronAPI) {
    const info = await window.electronAPI.getPathInfo(selectedItem.value.path)
    if (info.success) {
      navigator.clipboard.writeText(info.relative)
      ElMessage.success('已复制相对路径')
    }
  }
  closeMenu()
}

function openEditDialog() {
  if (selectedItem.value) {
    editForm.value = { ...selectedItem.value }
    showEditDialog.value = true
  }
  closeMenu()
}

async function handleEditItem() {
  await store.updateDirectoryItem(currentSetId.value, editForm.value.id, {
    alias: editForm.value.alias,
    tag: editForm.value.tag,
    description: editForm.value.description
  })
  ElMessage.success('保存成功')
  showEditDialog.value = false
}

async function handleDelete() {
  if (selectedItem.value) {
    try {
      await ElMessageBox.confirm('确定要移除此目录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await store.removeDirectoryItem(currentSetId.value, selectedItem.value.id)
      ElMessage.success('已移除')
    } catch {
      
    }
  }
  closeMenu()
}
</script>

<style scoped>
.directory-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  position: relative;
}

.content-area.drag-over {
  background: rgba(102, 126, 234, 0.1);
}

.drag-hint {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border: 2px dashed #667eea;
  border-radius: 8px;
  color: #667eea;
  font-size: 16px;
}

.tag-group {
  margin-bottom: 32px;
}

.tag-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.tag-label {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.tag-count {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.dir-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid transparent;
}

.dir-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.card-icon {
  font-size: 36px;
  margin-right: 12px;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-path {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  font-size: 12px;
  color: #c0c4cc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.path-input {
  display: flex;
  gap: 8px;
}

.path-input .el-input {
  flex: 1;
}

.context-menu {
  position: fixed;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 8px 0;
  z-index: 1000;
  min-width: 180px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #303133;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f5f7fa;
}

.menu-item span:first-child {
  margin-right: 10px;
}

.menu-item.danger {
  color: #f56c6c;
}

.menu-item.danger:hover {
  background: #fef0f0;
}
</style>
