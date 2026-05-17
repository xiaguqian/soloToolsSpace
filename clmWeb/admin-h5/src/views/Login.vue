<template>
  <div class="login-container">
    <div class="logo-area">
      <div class="logo">🍽️</div>
      <h1>餐饮管理</h1>
      <p>商户管理端</p>
    </div>
    <van-form @submit="handleLogin">
      <van-field v-model="phone" label="手机号" placeholder="请输入手机号" type="number" />
      <van-field v-model="password" label="密码" placeholder="请输入密码" type="password" />
      <div style="margin-top: 20px;">
        <van-button type="primary" block size="large" native-type="submit">登录</van-button>
      </div>
    </van-form>
    <div class="tips">
      <p>平台管理员：13800138000 / 123456</p>
      <p>商户管理员：13800138001 / 123456</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { auth } from '../utils/api'

const router = useRouter()

const phone = ref('')
const password = ref('')

const handleLogin = async () => {
  if (!phone.value || !password.value) {
    showToast('请输入手机号和密码')
    return
  }
  
  try {
    const res = await auth.login({ phone: phone.value, password: password.value })
    if (res.code === 200) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      showToast('登录成功')
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      showToast(res.message)
    }
  } catch (error) {
    showToast('登录失败')
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.logo-area {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  font-size: 80px;
  margin-bottom: 20px;
}

.logo-area h1 {
  color: white;
  font-size: 28px;
  margin-bottom: 8px;
}

.logo-area p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.tips {
  margin-top: 30px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.tips p {
  color: white;
  font-size: 12px;
  margin-bottom: 5px;
}

.tips p:last-child {
  margin-bottom: 0;
}
</style>
