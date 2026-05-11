<template>
  <div class="component-list">
    <div class="page-header">
      <h2 class="page-title">组件管理</h2>
      <el-divider />
    </div>

    <el-table :data="components" style="width: 100%" stripe>
      <el-table-column label="预设" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.is_preset ? 'success' : 'info'" size="small">
            {{ scope.row.is_preset ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="组件名称" prop="name" width="220" />
      <el-table-column label="中文名" prop="chinese_name" width="180">
        <template #default="scope">
          {{ scope.row.chinese_name || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="分类" prop="category" width="120" />
      <el-table-column label="描述" prop="description" min-width="200">
        <template #default="scope">
          {{ scope.row.description || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-button type="primary" link size="small" @click="handleView(scope.row)">
            查看
          </el-button>
          <el-button type="primary" link size="small" @click="handleEdit(scope.row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="viewDialogVisible"
      title="组件详情"
      width="700px"
    >
      <div v-if="currentComponent" class="component-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="组件名称">
            {{ currentComponent.name }}
          </el-descriptions-item>
          <el-descriptions-item label="中文名称">
            {{ currentComponent.chinese_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="分类">
            {{ currentComponent.category }}
          </el-descriptions-item>
          <el-descriptions-item label="是否预设">
            {{ currentComponent.is_preset ? '是' : '否' }}
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ currentComponent.description || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">入参 Schema</el-divider>
        <pre class="json-pre">{{ JSON.stringify(currentComponent.input_schema, null, 2) }}</pre>

        <el-divider content-position="left">出参 Schema</el-divider>
        <pre class="json-pre">{{ JSON.stringify(currentComponent.output_schema, null, 2) }}</pre>

        <el-divider content-position="left">组件代码</el-divider>
        <pre class="code-pre">{{ currentComponent.code }}</pre>
      </div>
    </el-dialog>

    <el-dialog
      v-model="editDialogVisible"
      title="编辑组件"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="组件名称">
          <el-input v-model="editForm.name" disabled />
        </el-form-item>
        <el-form-item label="中文名称">
          <el-input v-model="editForm.chinese_name" placeholder="请输入中文名称" />
        </el-form-item>
        <el-form-item label="组件描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入组件描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { componentApi } from '@/api'

const components = ref([])
const viewDialogVisible = ref(false)
const editDialogVisible = ref(false)
const currentComponent = ref(null)
const editForm = ref({
  name: '',
  chinese_name: '',
  description: ''
})

const loadComponents = async () => {
  try {
    const data = await componentApi.getAll()
    components.value = data
  } catch (error) {
    ElMessage.error('加载组件列表失败')
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString()
}

const handleView = (row) => {
  currentComponent.value = row
  viewDialogVisible.value = true
}

const handleEdit = (row) => {
  editForm.value = {
    id: row.id,
    name: row.name,
    chinese_name: row.chinese_name || '',
    description: row.description || ''
  }
  editDialogVisible.value = true
}

const resetForm = () => {
  editForm.value = {
    name: '',
    chinese_name: '',
    description: ''
  }
}

const handleUpdate = async () => {
  try {
    await componentApi.update(editForm.value.id, {
      chinese_name: editForm.value.chinese_name,
      description: editForm.value.description
    })
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    loadComponents()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

onMounted(() => {
  loadComponents()
})
</script>

<style scoped>
.component-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-height: calc(100vh - 140px);
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.json-pre, .code-pre {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 300px;
  overflow: auto;
}
</style>
