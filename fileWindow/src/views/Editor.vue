<template>
  <div class="editor-container">
    <div class="header">
      <el-button @click="$router.push('/')" :icon="ArrowLeft" circle />
      <div class="file-info">
        <span class="file-name">{{ currentFileName || '新建文档' }}</span>
        <el-tag v-if="isModified" type="danger" size="small" effect="dark">未保存</el-tag>
      </div>
      <div class="header-actions">
        <el-button 
          v-if="!isNewFile"
          @click="showSaveAsDialog = true"
        >
          另存为
        </el-button>
        <el-button 
          @click="isNewFile ? (showSaveAsDialog = true) : saveFile()"
          type="primary"
        >
          保存
        </el-button>
      </div>
    </div>

    <div class="editor-content">
      <textarea 
        v-model="content" 
        class="editor-textarea"
        placeholder="开始编写内容..."
        @input="handleInput"
      ></textarea>
    </div>

    <el-dialog v-model="showSaveAsDialog" title="保存文件" width="500px">
      <el-form :model="saveAsForm" label-width="80px">
        <el-form-item label="保存位置">
          <div class="path-input">
            <el-input v-model="saveAsForm.directory" placeholder="选择目标目录" readonly />
            <el-button @click="selectSaveDirectory">浏览</el-button>
          </div>
        </el-form-item>
        <el-form-item label="文件名">
          <el-input v-model="saveAsForm.name" placeholder="请输入文件名">
            <template #append>.md</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSaveAsDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAsFile">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const content = ref('')
const currentFilePath = ref('')
const isModified = ref(false)
const showSaveAsDialog = ref(false)

const saveAsForm = ref({
  directory: '',
  name: '未命名文档'
})

const isNewFile = computed(() => !currentFilePath.value)
const currentFileName = computed(() => {
  if (currentFilePath.value) {
    return currentFilePath.value.split(/[\\/]/).pop()
  }
  return null
})

onMounted(async () => {
  if (route.query.path) {
    currentFilePath.value = route.query.path
    const result = await window.electronAPI.readFile(route.query.path)
    if (result.success) {
      content.value = result.content
    }
  }
})

function handleInput() {
  isModified.value = true
}

async function saveFile() {
  if (!currentFilePath.value) {
    showSaveAsDialog.value = true
    return
  }
  
  const result = await window.electronAPI.saveFile(currentFilePath.value, content.value)
  if (result.success) {
    isModified.value = false
    ElMessage.success('保存成功')
  } else {
    ElMessage.error('保存失败: ' + result.error)
  }
}

async function selectSaveDirectory() {
  const dir = await window.electronAPI.selectDirectory()
  if (dir) {
    saveAsForm.value.directory = dir
  }
}

async function saveAsFile() {
  if (!saveAsForm.value.directory) {
    ElMessage.warning('请选择保存位置')
    return
  }
  if (!saveAsForm.value.name.trim()) {
    ElMessage.warning('请输入文件名')
    return
  }
  
  const filePath = `${saveAsForm.value.directory.replace(/[\\/]$/, '')}/${saveAsForm.value.name}.md`
  
  const exists = await window.electronAPI.pathExists(filePath)
  if (exists) {
    try {
      await ElMessageBox.confirm('文件已存在，是否覆盖？', '提示', {
        confirmButtonText: '覆盖',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch {
      return
    }
  }
  
  const result = await window.electronAPI.saveFile(filePath, content.value)
  if (result.success) {
    currentFilePath.value = filePath
    isModified.value = false
    showSaveAsDialog.value = false
    ElMessage.success('保存成功')
  } else {
    ElMessage.error('保存失败: ' + result.error)
  }
}
</script>

<style scoped>
.editor-container {
  height: 100vh;
  background: #1e1e1e;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: #252526;
  border-bottom: 1px solid #333;
  gap: 16px;
}

.file-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-name {
  color: #ccc;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.editor-content {
  flex: 1;
  overflow: hidden;
}

.editor-textarea {
  width: 100%;
  height: 100%;
  background: #1e1e1e;
  color: #d4d4d4;
  border: none;
  outline: none;
  padding: 24px;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
}

.editor-textarea::placeholder {
  color: #555;
}

.path-input {
  display: flex;
  gap: 8px;
}

.path-input .el-input {
  flex: 1;
}
</style>
