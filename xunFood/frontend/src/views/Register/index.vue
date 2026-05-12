<template>
  <div class="page-container register-page">
    <van-nav-bar title="注册" left-arrow @click-left="$router.back()" />

    <div class="register-header">
      <div class="logo">🍳</div>
      <h2>加入寻味</h2>
      <p>开始您的美食之旅</p>
    </div>

    <van-form @submit="handleRegister">
      <van-cell-group inset>
        <van-field
          v-model="form.phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          :rules="[{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]"
        />
        <van-field
          v-model="form.code"
          type="number"
          name="code"
          label="验证码"
          placeholder="请输入验证码"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <template #button>
            <van-button
              size="small"
              type="primary"
              :disabled="countdown > 0"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码'
            </van-button>
          </template>
        </van-field>
        <van-field
          v-model="form.nickname"
          name="nickname"
          label="昵称"
          placeholder="请输入昵称（可选）"
        />
        <van-field
          v-model="form.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
      </van-cell-group>
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          注册
        </van-button>
      </div>
    </van-form>

    <div class="footer">
      <span>已有账号？</span>
      <span class="login-link" @click="$router.push('/login')">立即登录</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { authApi } from '@/api'

const router = useRouter()

const loading = ref(false)
const countdown = ref(0)

const form = reactive({
  phone: '',
  code: '',
  nickname: '',
  password: ''
})

const sendCode = async () => {
  if (!form.phone || !/^1[3-9]\d{9}$/.test(form.phone)) {
    showToast('请输入正确的手机号')
    return
  }
  
  try {
    await authApi.sendSmsCode(form.phone)
    showToast('验证码已发送，测试环境验证码为123456')
    
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (e) {
    console.error(e)
  }
}

const handleRegister = async () => {
  loading.value = true
  try {
    await authApi.register(form.phone, form.code, form.password, form.nickname)
    showToast('注册成功，请登录')
    router.replace('/login')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.register-header {
  text-align: center;
  padding: 40px 0 30px;
  
  .logo {
    font-size: 60px;
  }
  
  h2 {
    font-size: 28px;
    color: #333;
    margin: 10px 0 5px;
  }
  
  p {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
}

.footer {
  text-align: center;
  padding: 30px;
  font-size: 14px;
  color: #999;
  
  .login-link {
    color: #ff6b6b;
    margin-left: 4px;
  }
}
</style>
