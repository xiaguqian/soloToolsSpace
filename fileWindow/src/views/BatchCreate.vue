<template>
  <div class="batch-create-container">
    <div class="header">
      <el-button @click="$router.push('/')" :icon="ArrowLeft" circle />
      <h2>资源批处理</h2>
    </div>

    <div class="content">
      <div class="form-card">
        <el-form :model="form" label-width="100px">
          <el-form-item label="创建类型">
            <el-radio-group v-model="form.createType">
              <el-radio value="file">批量创建文件</el-radio>
              <el-radio value="directory">批量创建目录</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="目标目录">
            <div class="path-select">
              <el-input v-model="form.targetDir" placeholder="选择目标目录" readonly />
              <el-button @click="selectTargetDir">浏览</el-button>
            </div>
          </el-form-item>

          <el-form-item label="创建规则">
            <el-radio-group v-model="form.ruleType" @change="onRuleChange">
              <el-radio value="increment">前缀+递增数字</el-radio>
              <el-radio value="separator">分隔符分割</el-radio>
              <el-radio value="custom">自定义列表</el-radio>
            </el-radio-group>
          </el-form-item>

          <template v-if="form.ruleType === 'increment'">
            <el-form-item label="名称前缀">
              <el-input v-model="form.prefix" placeholder="例如: chapter_" />
            </el-form-item>
            <el-form-item label="起始数字">
              <el-input-number v-model="form.startNum" :min="0" />
            </el-form-item>
            <el-form-item label="数量">
              <el-input-number v-model="form.count" :min="1" :max="1000" />
            </el-form-item>
            <el-form-item label="位数补零">
              <el-input-number v-model="form.padLength" :min="0" :max="10" />
              <span style="margin-left: 8px; color: #909399;">(0为不补零)</span>
            </el-form-item>
            <el-form-item label="后缀">
              <el-input v-model="form.suffix" placeholder="例如: .md 或留空" />
            </el-form-item>
          </template>

          <template v-else-if="form.ruleType === 'separator'">
            <el-form-item label="文本内容">
              <el-input
                v-model="form.separatorText"
                type="textarea"
                :rows="4"
                placeholder="输入内容，使用分隔符分割，例如: 第一章,第二章,第三章"
              />
            </el-form-item>
            <el-form-item label="分隔符">
              <el-input v-model="form.separator" placeholder="例如: , 或 空格" />
            </el-form-item>
            <el-form-item label="后缀">
              <el-input v-model="form.separatorSuffix" placeholder="例如: .md 或留空" />
            </el-form-item>
          </template>

          <template v-else>
            <el-form-item label="自定义列表">
              <el-input
                v-model="form.customList"
                type="textarea"
                :rows="6"
                placeholder="每行一个名称，例如：&#10;第一章.md&#10;第二章.md&#10;第三章.md"
              />
            </el-form-item>
          </template>

          <el-form-item>
            <el-button type="primary" @click="previewNames" :icon="View">
              预览名称
            </el-button>
            <el-button type="success" @click="executeCreate" :icon="Check" :disabled="!form.targetDir">
              执行创建
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-if="previewList.length > 0" class="preview-card">
        <h3>预览列表 (共 {{ previewList.length }} 个)</h3>
        <div class="preview-list">
          <div v-for="(name, index) in previewList" :key="index" class="preview-item">
            <span class="index">{{ index + 1 }}</span>
            <span class="name">{{ name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, View, Check } from '@element-plus/icons-vue'

const form = reactive({
  createType: 'file',
  targetDir: '',
  ruleType: 'increment',
  prefix: '',
  startNum: 1,
  count: 5,
  padLength: 2,
  suffix: '.md',
  separatorText: '',
  separator: ',',
  separatorSuffix: '.md',
  customList: ''
})

const previewList = ref([])

async function selectTargetDir() {
  const dir = await window.electronAPI.selectDirectory()
  if (dir) {
    form.targetDir = dir
  }
}

function onRuleChange() {
  previewList.value = []
}

function generateNames() {
  const names = []
  
  if (form.ruleType === 'increment') {
    for (let i = 0; i < form.count; i++) {
      const num = form.startNum + i
      const numStr = form.padLength > 0 ? String(num).padStart(form.padLength, '0') : String(num)
      names.push(`${form.prefix}${numStr}${form.suffix}`)
    }
  } else if (form.ruleType === 'separator') {
    if (form.separatorText && form.separator) {
      const parts = form.separatorText.split(form.separator)
      parts.forEach(part => {
        const name = part.trim()
        if (name) {
          names.push(`${name}${form.separatorSuffix}`)
        }
      })
    }
  } else {
    if (form.customList) {
      const lines = form.customList.split('\n')
      lines.forEach(line => {
        const name = line.trim()
        if (name) {
          names.push(name)
        }
      })
    }
  }
  
  return names
}

function previewNames() {
  const names = generateNames()
  if (names.length === 0) {
    ElMessage.warning('请输入有效的创建规则')
    return
  }
  if (names.length > 100) {
    previewList.value = names.slice(0, 100)
    ElMessage.info(`仅显示前100个预览，共 ${names.length} 个`)
  } else {
    previewList.value = names
  }
}

async function executeCreate() {
  if (!form.targetDir) {
    ElMessage.warning('请选择目标目录')
    return
  }
  
  const names = generateNames()
  if (names.length === 0) {
    ElMessage.warning('请输入有效的创建规则')
    return
  }
  
  const result = await window.electronAPI.createFiles(form.targetDir, names, form.createType)
  
  if (result.success) {
    ElMessage.success(`成功创建 ${names.length} 个${form.createType === 'file' ? '文件' : '目录'}`)
  } else {
    ElMessage.error('创建失败: ' + result.error)
  }
}
</script>

<style scoped>
.batch-create-container {
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-card,
.preview-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  height: fit-content;
}

.path-select {
  display: flex;
  gap: 8px;
  flex: 1;
}

.path-select .el-input {
  flex: 1;
}

.preview-card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.preview-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.preview-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #f2f6fc;
  font-size: 14px;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-item .index {
  width: 40px;
  color: #909399;
  font-family: Consolas, Monaco, monospace;
}

.preview-item .name {
  color: #303133;
}
</style>
