<template>
  <div class="task-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>任务管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增任务
          </el-button>
        </div>
      </template>

      <el-table :data="taskList" style="width: 100%" v-loading="loading">
        <el-table-column prop="jobId" label="任务ID" width="120" />
        <el-table-column prop="jobName" label="任务名称" />
        <el-table-column prop="taskType" label="任务类型" width="120">
          <template #default="scope">
            <el-tag :type="getTaskTypeColor(scope.row.taskType)">
              {{ getTaskTypeText(scope.row.taskType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="scheduleType" label="调度方式" width="100">
          <template #default="scope">
            {{ getScheduleTypeText(scope.row.scheduleType) }}
          </template>
        </el-table-column>
        <el-table-column prop="cronExpression" label="Cron表达式" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastExecuteTime" label="上次执行" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'STOPPED'"
              type="success"
              link
              size="small"
              @click="handleStart(scope.row)"
            >
              启动
            </el-button>
            <el-button
              v-if="scope.row.status === 'RUNNING'"
              type="warning"
              link
              size="small"
              @click="handleStop(scope.row)"
            >
              停止
            </el-button>
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click="handleUpdateCron(scope.row)"
            >
              修改时间
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="taskDialogVisible"
      :title="isEdit ? '编辑任务' : '新增任务'"
      width="700px"
    >
      <el-form :model="taskForm" :rules="taskRules" ref="taskFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务ID" prop="jobId">
              <el-input v-model="taskForm.jobId" placeholder="请输入任务唯一ID" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务名称" prop="jobName">
              <el-input v-model="taskForm.jobName" placeholder="请输入任务名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务类型" prop="taskType">
              <el-select v-model="taskForm.taskType" placeholder="请选择任务类型" style="width: 100%">
                <el-option label="本地Shell" value="LOCAL_SHELL" />
                <el-option label="本地代码" value="LOCAL_CODE" />
                <el-option label="远程HTTP" value="REMOTE_HTTP" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="调度方式" prop="scheduleType">
              <el-select v-model="taskForm.scheduleType" placeholder="请选择调度方式" style="width: 100%">
                <el-option label="Cron表达式" value="CRON" />
                <el-option label="固定频率" value="FIXED_RATE" />
                <el-option label="固定延迟" value="FIXED_DELAY" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" v-if="taskForm.scheduleType === 'CRON'">
            <el-form-item label="Cron表达式" prop="cronExpression">
              <el-input v-model="taskForm.cronExpression" placeholder="例如: 0 0/5 * * * ?" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="taskForm.scheduleType === 'FIXED_RATE'">
            <el-form-item label="固定频率(毫秒)" prop="fixedRate">
              <el-input-number v-model="taskForm.fixedRate" :min="1000" :max="86400000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="taskForm.scheduleType === 'FIXED_DELAY'">
            <el-form-item label="固定延迟(毫秒)" prop="fixedDelay">
              <el-input-number v-model="taskForm.fixedDelay" :min="1000" :max="86400000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="超时时间(秒)" prop="timeoutSeconds">
              <el-input-number v-model="taskForm.timeoutSeconds" :min="1" :max="3600" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="命令详情" prop="commandDetail">
          <el-input
            v-model="taskForm.commandDetail"
            type="textarea"
            :rows="3"
            placeholder="根据任务类型输入命令详情"
          />
        </el-form-item>
        <el-form-item label="参数(JSON)" prop="parameters">
          <el-input
            v-model="taskForm.parameters"
            type="textarea"
            :rows="2"
            placeholder="可选，JSON格式的参数键值对"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="taskForm.description" type="textarea" :rows="2" placeholder="任务描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTaskSubmit" :loading="taskSubmitting">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="cronDialogVisible"
      title="修改定时任务时间"
      width="400px"
    >
      <el-form :model="cronForm" :rules="cronRules" ref="cronFormRef" label-width="120px">
        <el-form-item label="Cron表达式" prop="cronExpression">
          <el-input v-model="cronForm.cronExpression" placeholder="例如: 0 0/5 * * * ?" />
        </el-form-item>
        <el-form-item label="常用表达式">
          <el-select v-model="cronPreset" placeholder="选择常用表达式" @change="handleCronPreset" style="width: 100%">
            <el-option label="每分钟" value="0 * * * * ?" />
            <el-option label="每5分钟" value="0 0/5 * * * ?" />
            <el-option label="每小时" value="0 0 * * * ?" />
            <el-option label="每天0点" value="0 0 0 * * ?" />
            <el-option label="每周一0点" value="0 0 0 ? * MON" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cronDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCronSubmit" :loading="cronSubmitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getTaskList,
  createTask,
  updateTask,
  deleteTask,
  startTask,
  stopTask,
  updateTaskCron
} from '../api/task'

const loading = ref(false)
const taskList = ref([])
const taskDialogVisible = ref(false)
const cronDialogVisible = ref(false)
const isEdit = ref(false)
const taskSubmitting = ref(false)
const cronSubmitting = ref(false)
const taskFormRef = ref(null)
const cronFormRef = ref(null)
const currentTaskId = ref(null)
const cronPreset = ref('')

const taskForm = reactive({
  id: null,
  jobId: '',
  jobName: '',
  taskType: 'LOCAL_SHELL',
  scheduleType: 'CRON',
  cronExpression: '',
  fixedRate: 60000,
  fixedDelay: 60000,
  commandDetail: '',
  parameters: '',
  timeoutSeconds: 60,
  description: ''
})

const cronForm = reactive({
  cronExpression: ''
})

const taskRules = {
  jobId: [{ required: true, message: '请输入任务ID', trigger: 'blur' }],
  jobName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  scheduleType: [{ required: true, message: '请选择调度方式', trigger: 'change' }],
  commandDetail: [{ required: true, message: '请输入命令详情', trigger: 'blur' }]
}

const cronRules = {
  cronExpression: [{ required: true, message: '请输入Cron表达式', trigger: 'blur' }]
}

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

const getScheduleTypeText = (type) => {
  switch (type) {
    case 'CRON': return 'Cron'
    case 'FIXED_RATE': return '固定频率'
    case 'FIXED_DELAY': return '固定延迟'
    default: return type
  }
}

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

const fetchTasks = async () => {
  loading.value = true
  try {
    const res = await getTaskList()
    taskList.value = res.data || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(taskForm, {
    id: null,
    jobId: '',
    jobName: '',
    taskType: 'LOCAL_SHELL',
    scheduleType: 'CRON',
    cronExpression: '',
    fixedRate: 60000,
    fixedDelay: 60000,
    commandDetail: '',
    parameters: '',
    timeoutSeconds: 60,
    description: ''
  })
  taskDialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(taskForm, {
    id: row.id,
    jobId: row.jobId,
    jobName: row.jobName,
    taskType: row.taskType,
    scheduleType: row.scheduleType,
    cronExpression: row.cronExpression || '',
    fixedRate: row.fixedRate || 60000,
    fixedDelay: row.fixedDelay || 60000,
    commandDetail: row.commandDetail || '',
    parameters: row.parameters || '',
    timeoutSeconds: row.timeoutSeconds || 60,
    description: row.description || ''
  })
  taskDialogVisible.value = true
}

const handleStart = async (row) => {
  try {
    await startTask(row.id)
    ElMessage.success('启动成功')
    fetchTasks()
  } catch (error) {
    console.error(error)
  }
}

const handleStop = async (row) => {
  try {
    await stopTask(row.id)
    ElMessage.success('停止成功')
    fetchTasks()
  } catch (error) {
    console.error(error)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除任务 "${row.jobName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteTask(row.id)
      ElMessage.success('删除成功')
      fetchTasks()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const handleUpdateCron = (row) => {
  currentTaskId.value = row.id
  cronForm.cronExpression = row.cronExpression || ''
  cronDialogVisible.value = true
}

const handleCronPreset = (value) => {
  cronForm.cronExpression = value
}

const handleTaskSubmit = () => {
  taskFormRef.value.validate(async (valid) => {
    if (valid) {
      taskSubmitting.value = true
      try {
        if (isEdit.value) {
          await updateTask(taskForm.id, taskForm)
          ElMessage.success('更新成功')
        } else {
          await createTask(taskForm)
          ElMessage.success('创建成功')
        }
        taskDialogVisible.value = false
        fetchTasks()
      } catch (error) {
        console.error(error)
      } finally {
        taskSubmitting.value = false
      }
    }
  })
}

const handleCronSubmit = () => {
  cronFormRef.value.validate(async (valid) => {
    if (valid) {
      cronSubmitting.value = true
      try {
        await updateTaskCron(currentTaskId.value, cronForm.cronExpression)
        ElMessage.success('更新成功')
        cronDialogVisible.value = false
        fetchTasks()
      } catch (error) {
        console.error(error)
      } finally {
        cronSubmitting.value = false
      }
    }
  })
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
