<template>
  <div class="log-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>日志查询</span>
          <div class="search-bar">
            <el-radio-group v-model="searchType" @change="handleSearchTypeChange">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="jobName">按任务名称</el-radio-button>
              <el-radio-button label="date">按日期</el-radio-button>
            </el-radio-group>
            <el-input
              v-if="searchType === 'jobName'"
              v-model="searchJobName"
              placeholder="请输入任务名称"
              style="width: 200px; margin-left: 16px"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-input>
            <el-date-picker
              v-if="searchType === 'date'"
              v-model="searchDate"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 200px; margin-left: 16px"
              @change="handleSearch"
            />
            <el-button
              type="primary"
              style="margin-left: 16px"
              :icon="Refresh"
              @click="fetchLogs"
            >
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="logList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="日志ID" width="120" />
        <el-table-column prop="jobId" label="任务ID" width="120" />
        <el-table-column prop="jobName" label="任务名称" />
        <el-table-column prop="taskType" label="任务类型" width="120">
          <template #default="scope">
            <el-tag :type="getTaskTypeColor(scope.row.taskType)">
              {{ getTaskTypeText(scope.row.taskType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="执行状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="durationMs" label="耗时(ms)" width="100" />
        <el-table-column prop="startTime" label="开始时间" width="200" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleViewDetail(scope.row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="日志详情" width="600px">
      <el-descriptions :column="1" border v-if="currentLog">
        <el-descriptions-item label="日志ID">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="任务ID">{{ currentLog.jobId }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ currentLog.jobName }}</el-descriptions-item>
        <el-descriptions-item label="任务类型">{{ getTaskTypeText(currentLog.taskType) }}</el-descriptions-item>
        <el-descriptions-item label="执行状态">
          <el-tag :type="getStatusType(currentLog.status)">
            {{ getStatusText(currentLog.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="耗时">{{ currentLog.durationMs }} ms</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentLog.startTime }}</el-descriptions-item>
        <el-descriptions-item label="错误信息" v-if="currentLog.errorMessage">
          {{ currentLog.errorMessage }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getAllLogs, getLogsByJobName, getLogsByDate, getLogById } from '../api/log'

const loading = ref(false)
const logList = ref([])
const searchType = ref('all')
const searchJobName = ref('')
const searchDate = ref('')
const detailDialogVisible = ref(false)
const currentLog = ref(null)

const getTaskTypeColor = (type) => {
  switch (type) {
    case 'LOCAL_SHELL': return 'primary'
    case 'LOCAL_CODE': return 'success'
    case 'REMOTE_HTTP': return 'warning'
    default: return 'info'
  }
}

const getTaskTypeText = (type) => {
  switch (type) {
    case 'LOCAL_SHELL': return '本地Shell'
    case 'LOCAL_CODE': return '本地代码'
    case 'REMOTE_HTTP': return '远程HTTP'
    default: return type
  }
}

const getStatusType = (status) => {
  switch (status) {
    case 'SUCCESS': return 'success'
    case 'FAILED': return 'danger'
    case 'RUNNING': return 'warning'
    default: return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'SUCCESS': return '成功'
    case 'FAILED': return '失败'
    case 'RUNNING': return '运行中'
    default: return status
  }
}

const fetchLogs = async () => {
  loading.value = true
  try {
    searchType.value = 'all'
    searchJobName.value = ''
    searchDate.value = ''
    const res = await getAllLogs()
    logList.value = res.data || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearchTypeChange = () => {
  if (searchType.value === 'all') {
    fetchLogs()
  }
}

const handleSearch = async () => {
  loading.value = true
  try {
    if (searchType.value === 'jobName' && searchJobName.value) {
      const res = await getLogsByJobName(searchJobName.value)
      logList.value = res.data || []
    } else if (searchType.value === 'date' && searchDate.value) {
      const res = await getLogsByDate(searchDate.value)
      logList.value = res.data || []
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleViewDetail = async (row) => {
  try {
    const res = await getLogById(row.id)
    currentLog.value = res.data || row
    detailDialogVisible.value = true
  } catch (error) {
    currentLog.value = row
    detailDialogVisible.value = true
  }
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  display: flex;
  align-items: center;
}
</style>
