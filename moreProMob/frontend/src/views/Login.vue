<template>
  <div class="login-container">
    <div class="login-box">
      <h2>商户管理系统</h2>
      <el-form ref="form" :model="form" label-width="80px" class="login-form">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login" class="login-btn">登录</el-button>
        </el-form-item>
      </el-form>
      <p class="tips">测试账号: 13800138000 密码: 123456</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '../api'

const form = reactive({
  phone: '',
  password: ''
})

const login = async () => {
  if (!form.phone || !form.password) {
    ElMessage.error('请填写完整信息')
    return
  }
  
  try {
    const res = await authApi.login(form)
    if (res.code === 200) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      localStorage.setItem('tenant', JSON.stringify(res.data.tenant))
      ElMessage.success('登录成功')
      window.location.href = '/'
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('登录失败')
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
  width: 90%;
  max-width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.login-form {
  margin-top: 20px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.tips {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #999;
}
</style>