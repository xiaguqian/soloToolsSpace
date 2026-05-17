<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <span>用户管理</span>
      </template>
      
      <el-table :data="users" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag :type="getRoleTagType(scope.row.role)">
              {{ getRoleLabel(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="editRole(scope.row)">修改角色</el-button>
            <el-button size="small" type="danger" @click="toggleStatus(scope.row)">
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="修改角色" v-model="roleDialogVisible">
      <el-form :model="selectedUser" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="selectedUser.username" disabled />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="selectedUser.role">
            <el-option label="管理员" value="admin" />
            <el-option label="作者" value="author" />
            <el-option label="读者" value="reader" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userApi } from '../api'

const users = ref([])
const roleDialogVisible = ref(false)
const selectedUser = ref({})

const loadUsers = () => {
  userApi.list().then(res => {
    users.value = res.data
  }).catch(err => {
    console.error(err)
  })
}

const editRole = (user) => {
  selectedUser.value = { ...user }
  roleDialogVisible.value = true
}

const saveRole = () => {
  userApi.updateRole(selectedUser.value.id, selectedUser.value.role).then(() => {
    roleDialogVisible.value = false
    loadUsers()
  }).catch(err => {
    console.error(err)
  })
}

const toggleStatus = (user) => {
  user.status = user.status === 1 ? 0 : 1
}

const getRoleLabel = (role) => {
  const labels = { admin: '管理员', author: '作者', reader: '读者' }
  return labels[role] || role
}

const getRoleTagType = (role) => {
  const types = { admin: 'danger', author: 'warning', reader: 'success' }
  return types[role] || 'info'
}

onMounted(() => {
  loadUsers()
})
</script>

<style>
.user-list {
  padding: 20px;
}
</style>