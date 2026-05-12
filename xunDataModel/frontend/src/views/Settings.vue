<template>
  <div class="page-card">
    <div class="page-header">
      <div class="page-title">个人设置</div>
    </div>
    
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="info">
        <el-card>
          <el-form :model="infoForm" ref="infoFormRef" label-width="100px" style="max-width: 500px">
            <el-form-item label="用户名">
              <el-input v-model="infoForm.username" disabled />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="infoForm.email" />
            </el-form-item>
            <el-form-item label="姓名">
              <el-input v-model="infoForm.full_name" />
            </el-form-item>
            <el-form-item label="角色">
              <el-tag :type="getRoleType(currentUser.role)" effect="plain">{{ getRoleText(currentUser.role) }}</el-tag>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="infoLoading" @click="handleUpdateInfo">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="修改密码" name="password">
        <el-card>
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px" style="max-width: 500px">
            <el-form-item label="原密码" prop="old_password">
              <el-input v-model="passwordForm.old_password" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="new_password">
              <el-input v-model="passwordForm.new_password" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirm_password">
              <el-input v-model="passwordForm.confirm_password" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="系统设置" name="system" v-if="isAdmin">
        <el-card>
          <el-form label-width="150px" style="max-width: 600px">
            <el-form-item label="系统访问开关">
              <el-switch v-model="systemEnabled" @change="handleToggleSystem" />
              <span style="margin-left: 10px; color: #909399">
                {{ systemEnabled ? '系统正常运行中' : '系统已暂停，外部用户无法访问' }}
              </span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store'
import { updateCurrentUser, changePassword, getCurrentUser } from '@/api/auth'
import { getSetting, toggleSystemAccess } from '@/api/admin'

const userStore = useUserStore()
const currentUser = computed(() => userStore.userInfo)
const isAdmin = computed(() => userStore.isAdmin)

const activeTab = ref('info')
const infoLoading = ref(false)
const passwordLoading = ref(false)
const infoFormRef = ref(null)
const passwordFormRef = ref(null)

const infoForm = reactive({
  username: '',
  email: '',
  full_name: ''
})

const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const systemEnabled = ref(true)

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.new_password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  old_password: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const getRoleText = (role) => {
  const map = { admin: '管理员', team_admin: '团队管理员', user: '普通用户' }
  return map[role] || role
}

const getRoleType = (role) => {
  const map = { admin: 'danger', team_admin: 'warning', user: 'info' }
  return map[role] || 'info'
}

const initForm = () => {
  if (currentUser.value) {
    infoForm.username = currentUser.value.username
    infoForm.email = currentUser.value.email
    infoForm.full_name = currentUser.value.full_name || ''
  }
}

const handleUpdateInfo = async () => {
  infoLoading.value = true
  try {
    await updateCurrentUser({
      email: infoForm.email,
      full_name: infoForm.full_name
    })
    await userStore.fetchUserInfo()
    ElMessage.success('保存成功')
  } finally {
    infoLoading.value = false
  }
}

const handleChangePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    await changePassword({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password
    })
    ElMessage.success('密码修改成功')
    passwordForm.old_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''
  } catch (error) {
    console.error(error)
  } finally {
    passwordLoading.value = false
  }
}

const fetchSystemSettings = async () => {
  if (!isAdmin.value) return
  try {
    const res = await getSetting('system_enabled')
    systemEnabled.value = res.data.setting_value === '1'
  } catch {}
}

const handleToggleSystem = async (val) => {
  try {
    await toggleSystemAccess(val)
    ElMessage.success(val ? '系统已启用' : '系统已暂停')
  } catch {
    systemEnabled.value = !val
  }
}

onMounted(() => {
  initForm()
  fetchSystemSettings()
})
</script>
