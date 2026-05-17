<template>
  <div class="role-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <el-button type="primary" @click="createRole">创建角色</el-button>
        </div>
      </template>
      
      <el-table :data="roles" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '暂停' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" @click="editRole(scope.row)">编辑</el-button>
            <el-button size="small" @click="toggleRoleStatus(scope.row)">
              {{ scope.row.status === 1 ? '暂停' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="deleteRole(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="角色信息" v-model="roleDialogVisible">
      <el-form :model="editRoleForm" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="editRoleForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editRoleForm.description" />
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
import { roleApi } from '../api'

const roles = ref([])
const roleDialogVisible = ref(false)
const editRoleForm = ref({})
const isEdit = ref(false)

const loadRoles = () => {
  roleApi.list().then(res => {
    roles.value = res.data
  }).catch(err => {
    console.error(err)
  })
}

const createRole = () => {
  editRoleForm.value = { name: '', description: '' }
  isEdit.value = false
  roleDialogVisible.value = true
}

const editRole = (role) => {
  editRoleForm.value = { id: role.id, name: role.name, description: role.description }
  isEdit.value = true
  roleDialogVisible.value = true
}

const saveRole = () => {
  if (isEdit.value) {
    roleApi.update(editRoleForm.value.id, editRoleForm.value).then(() => {
      roleDialogVisible.value = false
      loadRoles()
    })
  } else {
    roleApi.create(editRoleForm.value).then(() => {
      roleDialogVisible.value = false
      loadRoles()
    })
  }
}

const toggleRoleStatus = (role) => {
  role.status = role.status === 1 ? 0 : 1
  roleApi.update(role.id, role).then(() => {
    loadRoles()
  })
}

const deleteRole = (role) => {
  roleApi.delete(role.id).then(() => {
    loadRoles()
  })
}

onMounted(() => {
  loadRoles()
})
</script>

<style>
.role-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>