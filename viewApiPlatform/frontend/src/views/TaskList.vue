<template>
  <div class="task-list">
    <div class="page-header">
      <h2 class="page-title">爬虫管理</h2>
      <el-button type="primary" @click="goToCreate">
        <el-icon><Plus /></el-icon>
        新建爬虫
      </el-button>
    </div>
    <el-divider />

    <el-table :data="tasks" style="width: 100%" stripe>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)" size="small">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="任务名称" prop="name" width="180" />
      <el-table-column label="任务ID" prop="task_id" width="180" />
      <el-table-column label="描述" prop="description" min-width="200">
        <template #default="scope">
          {{ scope.row.description || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="调度类型" width="100">
        <template #default="scope">
          {{ scope.row.schedule_type === 'scheduled' ? '定时' : '手动' }}
        </template>
      </el-table-column>
      <el-table-column label="Cron 表达式" prop="cron_expression" width="150">
        <template #default="scope">
          {{ scope.row.cron_expression || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.updated_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="scope">
          <el-button
            v-if="scope.row.status === 'stopped'"
            type="success"
            link
            size="small"
            @click="handleStart(scope.row)"
          >
            启用
          </el-button>
          <el-button
            v-else
            type="warning"
            link
            size="small"
            @click="handleStop(scope.row)"
          >
            停用
          </el-button>
          <el-button type="primary" link size="small" @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button type="info" link size="small" @click="handleRunNow(scope.row)">
            立即执行
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="testResultVisible"
      title="执行结果"
      width="800px"
    >
      <pre class="result-pre">{{ testResult }}</pre>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { taskApi } from '@/api'

const router = useRouter()
const tasks = ref([])
const testResultVisible = ref(false)
const testResult = ref('')

const loadTasks = async () => {
  try {
    const data = await taskApi.getAll()
    tasks.value = data
  } catch (error) {
    ElMessage.error('加载任务列表失败')
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString()
}

const getStatusType = (status) => {
  const types = {
    running: 'success',
    stopped: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    running: '运行中',
    stopped: '已停止'
  }
  return texts[status] || status
}

const goToCreate = () => {
  router.push('/tasks/new')
}

const handleEdit = (row) => {
  router.push(`/tasks/edit/${row.id}`)
}

const handleStart = async (row) => {
  try {
    await taskApi.start(row.id)
    ElMessage.success('任务已启用')
    loadTasks()
  } catch (error) {
    ElMessage.error('启动失败')
  }
}

const handleStop = async (row) => {
  try {
    await taskApi.stop(row.id)
    ElMessage.success('任务已停用')
    loadTasks()
  } catch (error) {
    ElMessage.error('停止失败')
  }
}

const handleRunNow = async (row) => {
  try {
    const result = await taskApi.runNow(row.id)
    testResult.value = JSON.stringify(result, null, 2)
    testResultVisible.value = true
  } catch (error) {
    ElMessage.error('执行失败: ' + (error.response?.data?.detail || error.message))
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该爬虫任务吗？此操作不可恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await taskApi.delete(row.id)
    ElMessage.success('删除成功')
    loadTasks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.task-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-height: calc(100vh - 140px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.result-pre {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 500px;
  overflow: auto;
  white-space: pre-wrap;
}
</style>
