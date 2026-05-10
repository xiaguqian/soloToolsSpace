<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409EFF">
              <el-icon><List /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalTasks }}</div>
              <div class="stat-label">任务总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67C23A">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ runningTasks }}</div>
              <div class="stat-label">运行中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #E6A23C">
              <el-icon><VideoPause /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stoppedTasks }}</div>
              <div class="stat-label">已停止</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #F56C6C">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalUsers }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近任务</span>
            </div>
          </template>
          <el-table :data="recentTasks" style="width: 100%" v-loading="loading">
            <el-table-column prop="jobName" label="任务名称" />
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastExecuteTime" label="上次执行" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="当前用户">{{ nickname }}</el-descriptions-item>
            <el-descriptions-item label="用户角色">{{ getRoleText(role) }}</el-descriptions-item>
            <el-descriptions-item label="登录时间">{{ loginTime }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTaskList } from '../api/task'
import { getUserList } from '../api/user'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const totalTasks = ref(0)
const runningTasks = ref(0)
const stoppedTasks = ref(0)
const totalUsers = ref(0)
const recentTasks = ref([])

const nickname = localStorage.getItem('nickname') || '用户'
const role = localStorage.getItem('role')
const loginTime = new Date().toLocaleString()

const getStatusType = (status) => {
  switch (status) {
    case 'RUNNING': return 'success'
    case 'STOPPED': return 'info'
    case 'PAUSED': return 'warning'
    default: return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'RUNNING': return '运行中'
    case 'STOPPED': return '已停止'
    case 'PAUSED': return '已暂停'
    default: return status
  }
}

const getRoleText = (role) => {
  switch (role) {
    case 'ADMIN': return '管理员'
    case 'USER': return '普通用户'
    case 'VIEWER': return '只读用户'
    default: return role
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const taskRes = await getTaskList()
    const tasks = taskRes.data || []
    totalTasks.value = tasks.length
    runningTasks.value = tasks.filter(t => t.status === 'RUNNING').length
    stoppedTasks.value = tasks.filter(t => t.status === 'STOPPED').length
    recentTasks.value = tasks.slice(0, 5)

    if (role === 'ADMIN') {
      const userRes = await getUserList()
      totalUsers.value = (userRes.data || []).length
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
