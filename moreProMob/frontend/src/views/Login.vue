<template>
  <div class="login-container" @click.self="handleContainerClick">
    <div class="login-box">
      <h2>商户管理系统</h2>
      <form @submit.prevent="login" class="login-form">
        <div class="form-item">
          <label>手机号</label>
          <input 
            type="text" 
            v-model="form.phone" 
            placeholder="请输入手机号"
            class="form-input"
            @focus="handleFocus('phone')"
            @blur="handleBlur('phone')"
          />
        </div>
        <div class="form-item">
          <label>密码</label>
          <input 
            type="password" 
            v-model="form.password" 
            placeholder="请输入密码"
            class="form-input"
            @focus="handleFocus('password')"
            @blur="handleBlur('password')"
          />
        </div>
        <button type="submit" class="login-btn">登录</button>
      </form>
      <p class="tips">测试账号: 13800138000 密码: 123456</p>
      <div class="debug-info" v-if="debugText">{{ debugText }}</div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { authApi } from '../api'

const form = reactive({
  phone: '',
  password: ''
})

const debugText = ref('')

const handleFocus = (field) => {
  debugText.value = `聚焦: ${field}`
  console.log('聚焦:', field)
}

const handleBlur = (field) => {
  debugText.value = `失焦: ${field}`
  console.log('失焦:', field)
}

const handleContainerClick = () => {
  console.log('点击容器')
}

const login = async () => {
  if (!form.phone || !form.password) {
    alert('请填写完整信息')
    return
  }
  
  try {
    const res = await authApi.login(form)
    if (res.code === 200) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      localStorage.setItem('tenant', JSON.stringify(res.data.tenant))
      alert('登录成功')
      window.location.href = '/'
    } else {
      alert(res.message)
    }
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败')
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
  pointer-events: auto;
}

.login-box {
  width: 90%;
  max-width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
  pointer-events: auto;
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.login-form {
  margin-top: 20px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 15px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
  pointer-events: auto;
}

.form-input:focus {
  outline: none;
  border-color: #409eff;
}

.form-input::placeholder {
  color: #c0c4cc;
}

.login-btn {
  width: 100%;
  height: 44px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover {
  background: #67a3ff;
}

.login-btn:active {
  background: #3089e6;
}

.tips {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #999;
}

.debug-info {
  margin-top: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  text-align: center;
}
</style>