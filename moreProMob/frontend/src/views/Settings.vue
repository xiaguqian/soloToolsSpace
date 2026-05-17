<template>
  <div class="settings">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="basic">
        <div class="form-card">
          <el-form :model="tenantForm" label-width="120px">
            <el-form-item label="商户名称">
              <el-input v-model="tenantForm.name" />
            </el-form-item>
            <el-form-item label="Logo">
              <el-input v-model="tenantForm.logo" />
            </el-form-item>
            <el-form-item label="客服电话">
              <el-input v-model="tenantForm.service_phone" />
            </el-form-item>
            <el-form-item label="营业时间">
              <el-input v-model="tenantForm.business_hours" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveTenant">保存设置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="员工管理" name="staff">
        <div class="toolbar">
          <el-button type="primary" @click="showAddStaffModal = true">添加员工</el-button>
        </div>
        <el-table :data="staffList" border>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column prop="role" label="角色" width="100">
            <template #default="scope">
              {{ getRoleText(scope.row.role) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'warning'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180" />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button type="text" @click="editStaff(scope.row)">编辑</el-button>
              <el-button type="text" @click="deleteStaff(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    
    <el-dialog title="添加员工" :visible.sync="showAddStaffModal">
      <el-form :model="staffForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="staffForm.name" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="staffForm.phone" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="staffForm.password" type="password" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="staffForm.role">
            <el-option label="商户管理员" :value="1" />
            <el-option label="商户员工" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddStaffModal = false">取消</el-button>
        <el-button type="primary" @click="saveStaff">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { systemApi } from '../api'

const activeTab = ref('basic')
const showAddStaffModal = ref(false)
const staffList = ref([])

const tenantForm = reactive({
  name: '',
  logo: '',
  service_phone: '',
  business_hours: ''
})

const staffForm = reactive({
  id: '',
  name: '',
  phone: '',
  password: '',
  role: 2,
  status: 1
})

const roleMap = {
  0: '平台管理员',
  1: '商户管理员',
  2: '商户员工'
}

const getRoleText = (role) => {
  return roleMap[role] || '未知'
}

const loadTenant = async () => {
  try {
    const res = await systemApi.getTenant()
    if (res.code === 200) {
      const tenant = res.data
      tenantForm.name = tenant.name
      tenantForm.logo = tenant.logo
      tenantForm.service_phone = tenant.config_json?.service_phone || ''
      tenantForm.business_hours = tenant.config_json?.business_hours || ''
    }
  } catch (error) {
    console.error(error)
  }
}

const saveTenant = async () => {
  try {
    const res = await systemApi.updateTenant({
      name: tenantForm.name,
      logo: tenantForm.logo,
      config_json: {
        service_phone: tenantForm.service_phone,
        business_hours: tenantForm.business_hours
      }
    })
    if (res.code === 200) {
      ElMessage.success('保存成功')
      const tenant = JSON.parse(localStorage.getItem('tenant') || '{}')
      tenant.name = tenantForm.name
      tenant.logo = tenantForm.logo
      localStorage.setItem('tenant', JSON.stringify(tenant))
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const loadStaff = async () => {
  try {
    const res = await systemApi.getStaff()
    if (res.code === 200) {
      staffList.value = res.data
    }
  } catch (error) {
    console.error(error)
  }
}

const editStaff = (row) => {
  staffForm.id = row.id
  staffForm.name = row.name
  staffForm.phone = row.phone
  staffForm.role = row.role
  staffForm.status = row.status
  staffForm.password = ''
  showAddStaffModal.value = true
}

const saveStaff = async () => {
  if (!staffForm.name || !staffForm.phone) {
    ElMessage.error('请填写必填项')
    return
  }
  
  try {
    let res
    if (staffForm.id) {
      res = await systemApi.updateStaff(staffForm.id, {
        name: staffForm.name,
        phone: staffForm.phone,
        role: staffForm.role,
        status: staffForm.status
      })
    } else {
      if (!staffForm.password) {
        ElMessage.error('请设置密码')
        return
      }
      res = await systemApi.createStaff(staffForm)
    }
    
    if (res.code === 200) {
      ElMessage.success('保存成功')
      showAddStaffModal.value = false
      resetStaffForm()
      loadStaff()
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const resetStaffForm = () => {
  staffForm.id = ''
  staffForm.name = ''
  staffForm.phone = ''
  staffForm.password = ''
  staffForm.role = 2
  staffForm.status = 1
}

const deleteStaff = async (id) => {
  if (!confirm('确定删除该员工？')) return
  
  try {
    const res = await systemApi.deleteStaff(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadStaff()
    }
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadTenant()
  loadStaff()
})
</script>

<style scoped>
.settings {
  padding: 20px;
}

.form-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.toolbar {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .settings {
    padding: 10px;
  }
}
</style>