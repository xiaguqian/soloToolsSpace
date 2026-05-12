<template>
  <div class="page-card">
    <div class="page-header">
      <div class="page-title">请求日志</div>
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="模型ID">
          <el-input v-model="filterForm.model_id" placeholder="输入模型ID" style="width: 150px" clearable />
        </el-form-item>
        <el-form-item label="来源IP">
          <el-input v-model="filterForm.source_ip" placeholder="输入IP地址" style="width: 150px" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="model_name" label="模型" min-width="150">
        <template #default="{ row }">{{ row.model_name || `ID: ${row.model_id}` }}</template>
      </el-table-column>
      <el-table-column prop="request_path" label="请求路径" min-width="200" />
      <el-table-column prop="request_method" label="方法" width="80" />
      <el-table-column prop="source_ip" label="来源IP" width="130" />
      <el-table-column label="状态码" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status_code === 200 ? 'success' : 'danger'" size="small">
            {{ row.status_code || '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="response_time" label="响应时间(ms)" width="120" />
      <el-table-column prop="created_at" label="请求时间" width="180">
        <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
      </el-table-column>
    </el-table>
    
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; justify-content: flex-end"
      @size-change="fetchData"
      @current-change="fetchData"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getLogs } from '@/api/logs'

const loading = ref(false)
const tableData = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const filterForm = reactive({
  model_id: '',
  source_ip: ''
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      skip: (pagination.page - 1) * pagination.pageSize,
      limit: pagination.pageSize
    }
    if (filterForm.model_id) params.model_id = filterForm.model_id
    if (filterForm.source_ip) params.source_ip = filterForm.source_ip
    
    const res = await getLogs(params)
    tableData.value = res.data.items
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filterForm.model_id = ''
  filterForm.source_ip = ''
  pagination.page = 1
  fetchData()
}

onMounted(fetchData)
</script>
