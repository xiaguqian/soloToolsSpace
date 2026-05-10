<template>
  <div class="upload-container">
    <el-card class="upload-card">
      <template #header>
        <div class="card-header">
          <span>上传资源</span>
        </div>
      </template>
      
      <el-form :model="uploadForm" label-position="left" label-width="120px">
        <el-form-item label="来源系统">
          <el-select v-model="uploadForm.sourceSystem" placeholder="请选择来源系统" style="width: 200px">
            <el-option label="DAMM系统" value="DAMM" />
            <el-option label="其他系统" value="OTHER" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="访问权限">
          <el-select v-model="uploadForm.accessPermission" placeholder="请选择访问权限" style="width: 200px">
            <el-option label="公开 (public)" value="public" />
            <el-option label="私有 (private)" value="private" />
            <el-option v-if="userStore.isSystemUser" label="系统私有 (manage)" value="manage" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="上传方式">
          <el-radio-group v-model="uploadMode">
            <el-radio value="single">单文件上传</el-radio>
            <el-radio value="batch">批量上传</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="选择文件">
          <el-upload
            v-if="uploadMode === 'single'"
            ref="singleUploadRef"
            :auto-upload="false"
            :limit="1"
            :on-change="handleSingleFileChange"
            :on-remove="handleSingleFileRemove"
            :show-file-list="true"
            drag
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持单个文件上传，文件大小限制 50MB
              </div>
            </template>
          </el-upload>
          
          <el-upload
            v-else
            ref="batchUploadRef"
            :auto-upload="false"
            multiple
            :on-change="handleBatchFileChange"
            :on-remove="handleBatchFileRemove"
            :show-file-list="true"
            drag
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持多文件批量上传，单个文件大小限制 50MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="uploading" :disabled="!canUpload" @click="handleUpload">
            开始上传
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card v-if="uploadResult" class="result-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>上传结果</span>
        </div>
      </template>
      
      <div v-if="uploadResult.batch_id">
        <el-alert title="批量上传结果" type="success" :closable="false" style="margin-bottom: 15px">
          <template #default>
            <div>批次号: {{ uploadResult.batch_id }}</div>
            <div>总文件数: {{ uploadResult.total }}</div>
            <div>成功: {{ uploadResult.success_count }}</div>
            <div>失败: {{ uploadResult.fail_count }}</div>
          </template>
        </el-alert>
        
        <el-table :data="uploadResult.file_ids" style="width: 100%">
          <el-table-column label="文件ID" prop="file_id" />
        </el-table>
      </div>
      
      <div v-else>
        <el-alert title="上传成功" type="success" :closable="false">
          <template #default>
            <div>文件ID: {{ uploadResult.file_id }}</div>
            <div>原始文件名: {{ uploadResult.original_name }}</div>
          </template>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadFile, uploadBatchFiles } from '@/api/resource'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const singleUploadRef = ref(null)
const batchUploadRef = ref(null)
const uploading = ref(false)
const uploadMode = ref('single')
const singleFile = ref(null)
const batchFiles = ref([])
const uploadResult = ref(null)

const uploadForm = ref({
  sourceSystem: 'DAMM',
  accessPermission: 'public'
})

const canUpload = computed(() => {
  if (uploadMode.value === 'single') {
    return !!singleFile.value
  }
  return batchFiles.value.length > 0
})

const handleSingleFileChange = (file) => {
  singleFile.value = file.raw
}

const handleSingleFileRemove = () => {
  singleFile.value = null
}

const handleBatchFileChange = (file, fileList) => {
  batchFiles.value = fileList.map(f => f.raw)
}

const handleBatchFileRemove = (file, fileList) => {
  batchFiles.value = fileList.map(f => f.raw)
}

const handleUpload = async () => {
  try {
    uploading.value = true
    uploadResult.value = null
    
    const params = {
      sourceSystem: uploadForm.value.sourceSystem,
      accessPermission: uploadForm.value.accessPermission
    }
    
    if (uploadMode.value === 'single') {
      const res = await uploadFile(singleFile.value, params)
      uploadResult.value = res.data
      ElMessage.success('上传成功')
    } else {
      const res = await uploadBatchFiles(batchFiles.value, params)
      uploadResult.value = res.data
      ElMessage.success('批量上传完成')
    }
  } catch (error) {
    console.error('Upload error:', error)
  } finally {
    uploading.value = false
  }
}

const handleReset = () => {
  if (singleUploadRef.value) {
    singleUploadRef.value.clearFiles()
  }
  if (batchUploadRef.value) {
    batchUploadRef.value.clearFiles()
  }
  singleFile.value = null
  batchFiles.value = []
  uploadResult.value = null
  uploadForm.value = {
    sourceSystem: 'DAMM',
    accessPermission: 'public'
  }
}
</script>

<style scoped>
.upload-container {
  max-width: 800px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}
</style>
