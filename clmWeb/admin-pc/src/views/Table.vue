<template>
  <div class="table-page">
    <div class="page-header">
      <div class="search-bar">
        <el-input v-model="keyword" placeholder="搜索桌号名称" class="search-input" @keyup.enter="loadTables" />
        <el-button type="primary" @click="loadTables">搜索</el-button>
      </div>
      <div class="action-bar">
        <el-button type="success" @click="handleBatchEnable" :disabled="selectedIds.length === 0">批量启用</el-button>
        <el-button type="warning" @click="handleBatchDisable" :disabled="selectedIds.length === 0">批量禁用</el-button>
        <el-button type="info" @click="handleBatchGenerate" :disabled="selectedIds.length === 0">批量生成二维码</el-button>
        <el-button type="primary" @click="openAddModal">添加桌号</el-button>
      </div>
    </div>
    <el-table :data="tableList" border :selection-change="handleSelectionChange" class="table-list">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="table_name" label="桌号名称" />
      <el-table-column prop="qrcode_url" label="二维码" width="100">
        <template #default="scope">
          <el-button type="text" v-if="scope.row.qrcode_url" @click="previewQrcode(scope.row)">查看</el-button>
          <span v-else class="no-qrcode">未生成</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="text" @click="openEditModal(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleToggleStatus(scope.row)">
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button type="text" @click="handleGenerateQrcode(scope.row)">生成二维码</el-button>
          <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog :title="isEdit ? '编辑桌号' : '添加桌号'" :visible.sync="showModal" width="400px">
      <el-form :model="form" label-width="100px" class="modal-form">
        <el-form-item label="桌号名称">
          <el-input v-model="form.table_name" placeholder="请输入桌号名称（如A01）" />
        </el-form-item>
        <el-form-item label="桌号状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showModal = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">{{ isEdit ? '修改' : '添加' }}</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="二维码预览" :visible.sync="showQrcodeModal" width="300px">
      <div class="qrcode-preview" v-if="previewData">
        <img :src="previewData.qrcode_url" alt="二维码" />
        <p class="table-name">{{ previewData.table_name }}</p>
        <a :href="previewData.qrcode_url" download class="download-btn">下载图片</a>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { table as tableApi } from '../utils/api'

const keyword = ref('')
const tableList = ref([])
const selectedIds = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const showQrcodeModal = ref(false)
const previewData = ref(null)

const form = reactive({
  id: '',
  table_name: '',
  status: 1
})

const loadTables = async () => {
  try {
    const res = await tableApi.list()
    if (res.code === 200) {
      let data = res.data
      if (keyword.value) {
        data = data.filter(item => item.table_name.includes(keyword.value))
      }
      tableList.value = data
    }
  } catch (error) {
    ElMessage.error('获取桌号列表失败')
  }
}

const handleSelectionChange = (val) => {
  selectedIds.value = val.map(item => item.id)
}

const openAddModal = () => {
  isEdit.value = false
  Object.assign(form, {
    id: '',
    table_name: '',
    status: 1
  })
  showModal.value = true
}

const openEditModal = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    table_name: row.table_name,
    status: row.status
  })
  showModal.value = true
}

const handleSubmit = async () => {
  if (!form.table_name) {
    ElMessage.warning('请填写桌号名称')
    return
  }
  
  try {
    let res
    if (isEdit.value) {
      res = await tableApi.update(form.id, form)
    } else {
      res = await tableApi.add(form)
    }
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      showModal.value = false
      loadTables()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleToggleStatus = async (row) => {
  try {
    const res = await tableApi.update(row.id, { status: row.status === 1 ? 0 : 1 })
    if (res.code === 200) {
      ElMessage.success(row.status === 1 ? '禁用成功' : '启用成功')
      loadTables()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleGenerateQrcode = async (row) => {
  try {
    const res = await tableApi.generateQrcode({ table_id: row.id })
    if (res.code === 200) {
      ElMessage.success('生成成功')
      loadTables()
    }
  } catch (error) {
    ElMessage.error('生成失败')
  }
}

const handleBatchGenerate = async () => {
  try {
    const res = await tableApi.batchGenerateQrcode({ table_ids: selectedIds.value })
    if (res.code === 200) {
      ElMessage.success('批量生成成功')
      selectedIds.value = []
      loadTables()
    }
  } catch (error) {
    ElMessage.error('批量生成失败')
  }
}

const handleBatchEnable = async () => {
  try {
    const res = await tableApi.batchStatus({ ids: selectedIds.value, status: 1 })
    if (res.code === 200) {
      ElMessage.success('批量启用成功')
      selectedIds.value = []
      loadTables()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleBatchDisable = async () => {
  try {
    const res = await tableApi.batchStatus({ ids: selectedIds.value, status: 0 })
    if (res.code === 200) {
      ElMessage.success('批量禁用成功')
      selectedIds.value = []
      loadTables()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (row) => {
  if (!confirm(`确定要删除桌号「${row.table_name}」吗？`)) return
  
  try {
    const res = await tableApi.delete(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadTables()
    }
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const previewQrcode = (row) => {
  previewData.value = row
  showQrcodeModal.value = true
}

onMounted(() => {
  loadTables()
})
</script>

<style scoped>
.table-page {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 200px;
}

.action-bar {
  display: flex;
  gap: 10px;
}

.table-list {
  margin-bottom: 20px;
}

.no-qrcode {
  color: #909399;
}

.modal-form {
  padding: 20px 0;
}

.qrcode-preview {
  text-align: center;
  padding: 20px;
}

.qrcode-preview img {
  width: 200px;
  height: 200px;
}

.table-name {
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
}

.download-btn {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 20px;
  background: #409eff;
  color: white;
  border-radius: 4px;
  text-decoration: none;
}
</style>
