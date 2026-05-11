<template>
  <div class="settings-container">
    <div class="header">
      <el-button @click="$router.push('/')" :icon="ArrowLeft" circle />
      <h2>自定义常用信息</h2>
    </div>

    <div class="content">
      <el-tabs v-model="activeTab" class="custom-tabs">
        <el-tab-pane label="常用目录集" name="directories">
          <div class="panel-content">
            <div class="toolbar">
              <el-button type="primary" @click="showAddDirSetDialog = true" :icon="Plus">
                新增目录集
              </el-button>
            </div>

            <div class="set-list">
              <div
                v-for="set in directorySets"
                :key="set.id"
                class="set-card"
              >
                <div class="set-header">
                  <div class="set-title">
                    <span class="set-name">{{ set.name }}</span>
                    <el-tag v-if="set.id === defaultDirectorySetId" type="success" size="small">
                      默认
                    </el-tag>
                  </div>
                  <div class="set-actions">
                    <el-button
                      v-if="set.id !== defaultDirectorySetId"
                      size="small"
                      @click="setAsDefault(set.id, 'directory')"
                    >
                      设为默认
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      :disabled="directorySets.length <= 1"
                      @click="removeSet(set.id, 'directory')"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
                <div class="set-stats">
                  <span>目录数量: {{ set.items?.length || 0 }}</span>
                  <span>点击次数: {{ getDirectorySetStats(set.id) }}</span>
                </div>
                <el-collapse accordion>
                  <el-collapse-item title="查看详情">
                    <div class="items-detail">
                      <template v-if="set.items?.length > 0">
                        <div
                          v-for="item in set.items"
                          :key="item.id"
                          class="item-row"
                        >
                          <span class="item-name">{{ item.alias || item.name }}</span>
                          <span class="item-path">{{ item.path }}</span>
                          <el-tag v-if="item.tag" size="small">{{ item.tag }}</el-tag>
                          <span class="item-stats">点击: {{ getDirectoryItemStats(item.id) }}</span>
                        </div>
                      </template>
                      <span v-else class="empty-text">暂无目录</span>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="常用文件集" name="files">
          <div class="panel-content">
            <div class="toolbar">
              <el-button type="primary" @click="showAddFileSetDialog = true" :icon="Plus">
                新增文件集
              </el-button>
            </div>

            <div class="set-list">
              <div
                v-for="set in fileSets"
                :key="set.id"
                class="set-card"
              >
                <div class="set-header">
                  <div class="set-title">
                    <span class="set-name">{{ set.name }}</span>
                    <el-tag v-if="set.id === defaultFileSetId" type="success" size="small">
                      默认
                    </el-tag>
                  </div>
                  <div class="set-actions">
                    <el-button
                      v-if="set.id !== defaultFileSetId"
                      size="small"
                      @click="setAsDefault(set.id, 'file')"
                    >
                      设为默认
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      :disabled="fileSets.length <= 1"
                      @click="removeSet(set.id, 'file')"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
                <div class="set-stats">
                  <span>文件数量: {{ set.items?.length || 0 }}</span>
                  <span>点击次数: {{ getFileSetStats(set.id) }}</span>
                </div>
                <el-collapse accordion>
                  <el-collapse-item title="查看详情">
                    <div class="items-detail">
                      <template v-if="set.items?.length > 0">
                        <div
                          v-for="item in set.items"
                          :key="item.id"
                          class="item-row"
                        >
                          <span class="item-name">{{ item.alias || item.name }}</span>
                          <span class="item-path">{{ item.path }}</span>
                          <el-tag v-if="item.tag" size="small">{{ item.tag }}</el-tag>
                          <span class="item-stats">点击: {{ getFileItemStats(item.id) }}</span>
                        </div>
                      </template>
                      <span v-else class="empty-text">暂无文件</span>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="其他设置" name="other">
          <div class="panel-content">
            <div class="setting-item">
              <div class="setting-info">
                <h4>文本文件打开方式</h4>
                <p>启用后，txt、md 等纯文本文件将优先使用本应用打开</p>
              </div>
              <el-switch
                v-model="useAppForTextFiles"
                @change="handleUseAppChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="showAddDirSetDialog" title="新增目录集" width="400px">
      <el-form :model="newDirSetForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="newDirSetForm.name" placeholder="请输入目录集名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDirSetDialog = false">取消</el-button>
        <el-button type="primary" @click="addDirectorySet">添加</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showAddFileSetDialog" title="新增文件集" width="400px">
      <el-form :model="newFileSetForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="newFileSetForm.name" placeholder="请输入文件集名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddFileSetDialog = false">取消</el-button>
        <el-button type="primary" @click="addFileSet">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from '../store'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'

const store = useStore()
const activeTab = ref('directories')
const showAddDirSetDialog = ref(false)
const showAddFileSetDialog = ref(false)

const newDirSetForm = ref({ name: '' })
const newFileSetForm = ref({ name: '' })

const directorySets = computed(() => store.state.config?.directorySets || [])
const fileSets = computed(() => store.state.config?.fileSets || [])
const defaultDirectorySetId = computed(() => store.state.config?.defaultDirectorySetId)
const defaultFileSetId = computed(() => store.state.config?.defaultFileSetId)
const useAppForTextFiles = computed({
  get: () => store.state.config?.useAppForTextFiles || false,
  set: (val) => {}
})

function getDirectorySetStats(setId) {
  return store.state.stats?.directorySets?.[setId] || 0
}

function getDirectoryItemStats(itemId) {
  return store.state.stats?.directoryItems?.[itemId] || 0
}

function getFileSetStats(setId) {
  return store.state.stats?.fileSets?.[setId] || 0
}

function getFileItemStats(itemId) {
  return store.state.stats?.fileItems?.[itemId] || 0
}

async function addDirectorySet() {
  if (!newDirSetForm.value.name.trim()) {
    ElMessage.warning('请输入名称')
    return
  }
  const newSet = {
    id: `dir-set-${Date.now()}`,
    name: newDirSetForm.value.name,
    isDefault: false,
    items: []
  }
  await store.addDirectorySet(newSet)
  ElMessage.success('添加成功')
  showAddDirSetDialog.value = false
  newDirSetForm.value.name = ''
}

async function addFileSet() {
  if (!newFileSetForm.value.name.trim()) {
    ElMessage.warning('请输入名称')
    return
  }
  const newSet = {
    id: `file-set-${Date.now()}`,
    name: newFileSetForm.value.name,
    isDefault: false,
    items: []
  }
  await store.addFileSet(newSet)
  ElMessage.success('添加成功')
  showAddFileSetDialog.value = false
  newFileSetForm.value.name = ''
}

async function setAsDefault(setId, type) {
  if (type === 'directory') {
    store.setCurrentDirectorySetId(setId)
  } else {
    store.setCurrentFileSetId(setId)
  }
  ElMessage.success('已设为默认')
}

async function removeSet(setId, type) {
  try {
    await ElMessageBox.confirm('确定要删除此集合吗？其中的所有项目也将被删除。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    if (type === 'directory') {
      await store.removeDirectorySet(setId)
    } else {
      await store.removeFileSet(setId)
    }
    ElMessage.success('已删除')
  } catch {
    
  }
}

function handleUseAppChange(val) {
  store.setUseAppForTextFiles(val)
}
</script>

<style scoped>
.settings-container {
  height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  gap: 16px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.custom-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.panel-content {
  padding: 16px 0;
}

.toolbar {
  margin-bottom: 20px;
}

.set-list {
  display: grid;
  gap: 16px;
}

.set-card {
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
}

.set-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.set-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.set-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.set-actions {
  display: flex;
  gap: 8px;
}

.set-stats {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}

.items-detail {
  max-height: 300px;
  overflow-y: auto;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 13px;
}

.item-name {
  font-weight: 600;
  color: #303133;
  min-width: 150px;
}

.item-path {
  flex: 1;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 12px;
}

.item-stats {
  color: #c0c4cc;
  margin-left: 12px;
}

.empty-text {
  color: #c0c4cc;
  font-size: 13px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.setting-info h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
  color: #303133;
}

.setting-info p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}
</style>
