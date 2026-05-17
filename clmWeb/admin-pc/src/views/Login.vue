<template>
  <div class="login-container">
    <div class="login-box">
      <h2>餐饮点餐系统</h2>
      <h3>商户管理端</h3>
      <el-form ref="loginForm" :model="form" label-width="80px" class="login-form">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" class="login-btn">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="tips">
        <p>平台管理员：13800138000 / 123456</p>
        <p>商户管理员：13800138001 / 123456</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { auth } from '../utils/api'

const form = reactive({
  phone: '',
  password: ''
})

const loginForm = ref(null)

const handleLogin = async () => {
  if (!form.phone || !form.password) {
    ElMessage.warning('请输入手机号和密码')
    return
  }
  
  try {
    const res = await auth.login(form)
    if (res.code === 200) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      ElMessage.success('登录成功')
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('登录失败，请稍后重试')
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 400px;
  text-align: center;
}

.login-box h2 {
  color: #303133;
  margin-bottom: 8px;
  font-size: 24px;
}

.login-box h3 {
  color: #909399;
  margin-bottom: 30px;
  font-size: 14px;
  font-weight: normal;
}

.login-form {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  height: 40px;
}

.tips {
  text-align: left;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.tips p {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}
</style>
