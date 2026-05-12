<template>
  <div class="page-card">
    <div class="page-header">
      <div class="page-title">访问控制</div>
      <el-space>
        <el-button type="primary" @click="handleAdd('whitelist')">
          <el-icon><Plus /></el-icon>
          添加白名单
        </el-button>
        <el-button type="danger" @click="handleAdd('blacklist')">
          <el-icon><Plus /></el-icon>
          添加黑名单
        </el-button>
      </el-space>
    </div>
    
    <el-tabs v-model="activeTab">
      <el-tab-pane label="白名单" name="whitelist">
        <el-alert type="info" :closable="false" style="margin-bottom: 15px">
          如果白名单不为空，则只有白名单内的IP可以访问系统
        </el-alert>
        <el-table :data="whitelist" v-loading="loading" stripe style="width: 100%">
          <el-table-column prop="ip_address" label="IP地址" min-width="200" />
          <el-table-column prop="description" label="说明" min-width="200" />
          <el-table-column prop="created_at" label="添加时间" width="180">
            <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      
      <el-tab-pane label="黑名单" name="blacklist">
        <el-alert type="warning" :closable="false" style="margin-bottom: 15px">
          黑名单内的IP无法访问系统
        </el-alert>
        <el-table :data="blacklist" v-loading="loading" stripe style="width: 100%">
          <el-table-column prop="ip_address" label="IP地址" min-width="200" />
          <el-table-column prop="description" label="说明" min-width="200" />
          <el-table-column prop="created_at" label="添加时间" width="180">
            <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
  
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="450px" destroy-on-close>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="IP地址" prop="ip_address">
        <el-input v-model="form.ip_address" placeholder="如: 192.168.1.1 或 192.168.1.0/24" />
      </el-form-item>
      <el-form-item label="说明">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="备注说明" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAccessList, createAccess, deleteAccess } from '@/api/access'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const activeTab = ref('whitelist')
const whitelist = ref([])
const blacklist = ref([])

const form = reactive({
  type: 'whitelist',
  ip_address: '',
  description: ''
})

const rules = {
  ip_address: [{ required: true, message: '请输入IP地址', trigger: 'blur' }]
}

const dialogTitle = computed(() => form.type === 'whitelist' ? '添加白名单' : '添加黑名单')

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const fetchData = async () => {
  loading.value = true
  try {
    const [wRes, bRes] = await Promise.all([
      getAccessList({ type: 'whitelist', limit: 1000 }),
      getAccessList({ type: 'blacklist', limit: 1000 })
    ])
    whitelist.value = wRes.data.items
    blacklist.value = bRes.data.items
  } finally {
    loading.value = false
  }
}

const handleAdd = (type) => {
  Object.assign(form, { type, ip_address: '', description: '' })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    await createAccess(form)
    ElMessage.success('添加成功')
    dialogVisible.value = false
    await fetchData()
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该规则吗？', '提示', { type: 'warning' })
    await deleteAccess(row.id)
    ElMessage.success('删除成功')
    await fetchData()
  } catch {}
}

onMounted(fetchData)
</script>
