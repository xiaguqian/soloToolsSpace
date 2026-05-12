<template>
  <div class="page-card">
    <div class="page-header">
      <div class="page-title">用户管理</div>
    </div>
    
    <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="email" label="邮箱" min-width="200" />
      <el-table-column prop="full_name" label="姓名" min-width="100" />
      <el-table-column label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="getRoleType(row.role)" effect="plain">{{ getRoleText(row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.is_active ? 'success' : 'danger'" effect="plain">
            {{ row.is_active ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="last_login_at" label="最后登录" width="180">
        <template #default="{ row }">{{ row.last_login_at ? formatDate(row.last_login_at) : '-' }}</template>
      </el-table-column>
      <el-table-column prop="created_at" label="注册时间" width="180">
        <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
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
  
  <el-dialog v-model="dialogVisible" title="编辑用户" width="500px" destroy-on-close>
    <el-form :model="form" ref="formRef" label-width="80px">
      <el-form-item label="邮箱">
        <el-input v-model="form.email" />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="form.full_name" />
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="form.role" style="width: 100%">
          <el-option label="普通用户" value="user" />
          <el-option label="团队管理员" value="team_admin" />
          <el-option label="管理员" value="admin" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="form.is_active" />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="form.password" type="password" show-password placeholder="留空则不修改" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUsers, updateUser } from '@/api/admin'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const tableData = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  email: '',
  full_name: '',
  role: 'user',
  is_active: true,
  password: ''
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const getRoleText = (role) => {
  const map = { admin: '管理员', team_admin: '团队管理员', user: '普通用户' }
  return map[role] || role
}

const getRoleType = (role) => {
  const map = { admin: 'danger', team_admin: 'warning', user: 'info' }
  return map[role] || 'info'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUsers({ skip: (pagination.page - 1) * pagination.pageSize, limit: pagination.pageSize })
    tableData.value = res.data.items
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

const handleEdit = (row) => {
  Object.assign(form, {
    id: row.id,
    email: row.email,
    full_name: row.full_name || '',
    role: row.role,
    is_active: row.is_active,
    password: ''
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  submitLoading.value = true
  try {
    const data = { ...form }
    if (!data.password) delete data.password
    await updateUser(form.id, data)
    ElMessage.success('更新成功')
    dialogVisible.value = false
    await fetchData()
  } finally {
    submitLoading.value = false
  }
}

onMounted(fetchData)
</script>
