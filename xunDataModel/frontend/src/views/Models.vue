<template>
  <div class="page-card">
    <div class="page-header">
      <div class="page-title">模型管理</div>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增模型
      </el-button>
    </div>
    
    <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="name" label="模型名称" min-width="150" />
      <el-table-column prop="provider_name" label="提供商" min-width="120" />
      <el-table-column prop="api_type_name" label="API类型" min-width="100" />
      <el-table-column prop="version" label="版本" min-width="100" />
      <el-table-column label="标签" min-width="200">
        <template #default="{ row }">
          <span v-for="tag in row.tags" :key="tag.id" class="tag-item">{{ tag.name }}</span>
          <span v-if="!row.tags?.length" style="color: #909399">-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.is_enabled ? 'success' : 'danger'" effect="plain">
            {{ row.is_enabled ? '已启用' : '未启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="request_count" label="请求次数" width="100" />
      <el-table-column label="免费额度" width="100">
        <template #default="{ row }">
          <span v-if="row.has_free_quota">{{ row.remaining_quota ?? '无限' }}</span>
          <span v-else style="color: #909399">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleTest(row)">测试连接</el-button>
          <el-button v-if="!row.is_enabled" size="small" type="success" link @click="handleToggle(row, true)">启用</el-button>
          <el-button v-else size="small" type="warning" link @click="handleToggle(row, false)">停用</el-button>
          <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
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
  
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" destroy-on-close>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="模型名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入模型名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模型提供商" prop="provider_name">
            <el-select v-model="form.provider_name" filterable allow-create placeholder="选择或输入提供商">
              <el-option v-for="p in providers" :key="p.id" :label="p.name" :value="p.name" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="模型版本" prop="version">
            <el-input v-model="form.version" placeholder="如: gpt-4, claude-3" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="API类型" prop="api_type_id">
            <el-select v-model="form.api_type_id" placeholder="选择API类型">
              <el-option v-for="t in apiTypes" :key="t.id" :label="t.name" :value="t.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="请求地址" prop="request_url">
        <el-input v-model="form.request_url" placeholder="如: https://api.openai.com/v1/chat/completions" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="API Key" prop="api_key">
            <el-input v-model="form.api_key" type="password" show-password placeholder="请输入API Key" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组织ID (可选)">
            <el-input v-model="form.organization_id" placeholder="OpenAI Organization ID" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="代理URL (可选)">
            <el-input v-model="form.proxy_url" placeholder="代理服务器地址" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模型标签">
            <el-select v-model="form.tag_ids" multiple placeholder="选择标签">
              <el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.id" :disabled="!t.is_active" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="默认参数">
        <el-input v-model="form.default_params_str" type="textarea" :rows="3" placeholder='JSON格式, 如: {"temperature": 0.7}' />
      </el-form-item>
      <el-form-item label="备注说明">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="用途说明" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="是否有免费额度">
            <el-switch v-model="form.has_free_quota" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="剩余免费额度" v-if="form.has_free_quota">
            <el-input-number v-model="form.remaining_quota" :min="1" style="width: 200px" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
  
  <el-dialog v-model="testDialogVisible" title="测试模型连接" width="600px">
    <el-form label-width="100px">
      <el-form-item label="测试消息">
        <el-input v-model="testMessage" type="textarea" :rows="3" placeholder="输入测试消息" />
      </el-form-item>
    </el-form>
    <el-button type="primary" :loading="testLoading" @click="doTest">发送测试</el-button>
    <el-card style="margin-top: 20px" v-if="testResult">
      <div :style="{ color: testResult.success ? '#67c23a' : '#f56c6c', fontWeight: 'bold', marginBottom: '10px' }">
        {{ testResult.message }}
      </div>
      <div v-if="testResult.status_code" style="color: #909399; margin-bottom: 10px">
        状态码: {{ testResult.status_code }}
      </div>
      <div style="white-space: pre-wrap; word-break: break-all; max-height: 300px; overflow-y: auto">
        {{ testResult.response }}
      </div>
    </el-card>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getModels, createModel, updateModel, deleteModel, toggleModel, testModel, getProviders, getApiTypes } from '@/api/models'
import { getTags } from '@/api/tags'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const tableData = ref([])
const providers = ref([])
const apiTypes = ref([])
const tags = ref([])

const testDialogVisible = ref(false)
const testLoading = ref(false)
const testMessage = ref('你好，请回复一条测试消息')
const testResult = ref(null)
const currentTestModel = ref(null)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  name: '',
  provider_name: '',
  version: '',
  api_type_id: null,
  request_url: '',
  api_key: '',
  organization_id: '',
  proxy_url: '',
  default_params_str: '',
  description: '',
  has_free_quota: false,
  remaining_quota: null,
  tag_ids: []
})

const rules = {
  name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  provider_name: [{ required: true, message: '请选择或输入提供商', trigger: 'change' }],
  api_type_id: [{ required: true, message: '请选择API类型', trigger: 'change' }],
  request_url: [{ required: true, message: '请输入请求地址', trigger: 'blur' }],
  api_key: [{ required: true, message: '请输入API Key', trigger: 'blur' }]
}

const dialogTitle = computed(() => form.id ? '编辑模型' : '新增模型')

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getModels({ skip: (pagination.page - 1) * pagination.pageSize, limit: pagination.pageSize })
    tableData.value = res.data.items
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

const fetchOptions = async () => {
  const [pRes, tRes, tagRes] = await Promise.all([getProviders(), getApiTypes(), getTags({ limit: 1000 })])
  providers.value = pRes.data
  apiTypes.value = tRes.data
  tags.value = tagRes.data.items
}

const handleAdd = () => {
  Object.assign(form, {
    id: null,
    name: '',
    provider_name: '',
    version: '',
    api_type_id: null,
    request_url: '',
    api_key: '',
    organization_id: '',
    proxy_url: '',
    default_params_str: '',
    description: '',
    has_free_quota: false,
    remaining_quota: null,
    tag_ids: []
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, {
    id: row.id,
    name: row.name,
    provider_name: row.provider_name,
    version: row.version || '',
    api_type_id: row.api_type_id,
    request_url: row.request_url,
    api_key: row.api_key,
    organization_id: row.organization_id || '',
    proxy_url: row.proxy_url || '',
    default_params_str: row.default_params ? JSON.stringify(row.default_params, null, 2) : '',
    description: row.description || '',
    has_free_quota: row.has_free_quota,
    remaining_quota: row.remaining_quota,
    tag_ids: (row.tags || []).map(t => t.id)
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    const data = {
      name: form.name,
      provider_name: form.provider_name,
      version: form.version || null,
      api_type_id: form.api_type_id,
      request_url: form.request_url,
      api_key: form.api_key,
      organization_id: form.organization_id || null,
      proxy_url: form.proxy_url || null,
      default_params: null,
      description: form.description || null,
      has_free_quota: form.has_free_quota,
      remaining_quota: form.has_free_quota ? form.remaining_quota : null,
      tag_ids: form.tag_ids
    }
    
    if (form.default_params_str) {
      try {
        data.default_params = JSON.parse(form.default_params_str)
      } catch {
        ElMessage.error('默认参数不是有效的JSON格式')
        return
      }
    }
    
    if (form.id) {
      await updateModel(form.id, data)
      ElMessage.success('更新成功')
    } else {
      await createModel(data)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await fetchData()
    await fetchOptions()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该模型吗？', '提示', { type: 'warning' })
    await deleteModel(row.id)
    ElMessage.success('删除成功')
    await fetchData()
  } catch {}
}

const handleToggle = async (row, enable) => {
  await toggleModel(row.id, enable)
  ElMessage.success(enable ? '已启用' : '已停用')
  await fetchData()
}

const handleTest = (row) => {
  currentTestModel.value = row
  testResult.value = null
  testDialogVisible.value = true
}

const doTest = async () => {
  testLoading.value = true
  try {
    const res = await testModel(currentTestModel.value.id, testMessage.value)
    testResult.value = res.data
  } finally {
    testLoading.value = false
  }
}

onMounted(() => {
  fetchData()
  fetchOptions()
})
</script>
