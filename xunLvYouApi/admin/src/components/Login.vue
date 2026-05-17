<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 style="text-align: center; margin-bottom: 20px">巡旅游管理台登录</h2>
      <el-form :model="loginForm" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="nickname">
          <el-input v-model="loginForm.nickname" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'

const emit = defineEmits(['login'])

const loginFormRef = ref(null)
const loginForm = reactive({
  nickname: '',
  password: ''
})

const handleLogin = async () => {
  try {
    const response = await axios.post('/api/user/login', loginForm)
    if (response.data.success && response.data.role === 'admin') {
      localStorage.setItem('token', response.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      emit('login')
    } else {
      alert('登录失败，请检查用户名和密码')
    }
  } catch (error) {
    alert('登录失败: ' + error.message)
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}
.login-card {
  width: 400px;
}
</style>