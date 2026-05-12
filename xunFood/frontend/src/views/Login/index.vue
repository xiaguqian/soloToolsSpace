<template>
  <div class="page-container login-page">
    <van-nav-bar title="登录" left-arrow @click-left="$router.back()" />

    <div class="login-header">
      <div class="logo">🍳</div>
      <h2>寻味</h2>
      <p>发现生活的美味</p>
    </div>

    <van-tabs v-model:active="loginType" class="login-tabs">
      <van-tab title="手机号登录" name="phone">
        <van-form @submit="handlePhoneLogin">
          <van-cell-group inset>
            <van-field
              v-model="phoneForm.phone"
              name="phone"
              label="手机号"
              placeholder="请输入手机号"
              :rules="[{ required: true, message: '请输入手机号' }]"
            />
            <van-field
              v-model="phoneForm.code"
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
                  {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                </van-button>
              </template>
            </van-field>
          </van-cell-group>
          <div style="margin: 16px;">
            <van-button round block type="primary" native-type="submit" :loading="loading">
              登录
            </van-button>
          </div>
        </van-form>
      </van-tab>
      
      <van-tab title="密码登录" name="password">
        <van-form @submit="handlePasswordLogin">
          <van-cell-group inset>
            <van-field
              v-model="passwordForm.account"
              name="account"
              label="账号"
              placeholder="手机号或用户名"
              :rules="[{ required: true, message: '请输入账号' }]"
            />
            <van-field
              v-model="passwordForm.password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="[{ required: true, message: '请输入密码' }]"
            />
          </van-cell-group>
          <div style="margin: 16px;">
            <van-button round block type="primary" native-type="submit" :loading="loading">
              登录
            </van-button>
          </div>
        </van-form>
      </van-tab>
    </van-tabs>

    <div class="footer">
      <span>还没有账号？</span>
      <span class="register-link" @click="$router.push('/register')">立即注册</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { authApi } from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginType = ref('phone')
const loading = ref(false)
const countdown = ref(0)

const phoneForm = reactive({
  phone: '',
  code: ''
})

const passwordForm = reactive({
  account: '',
  password: ''
})

const sendCode = async () => {
  if (!phoneForm.phone || !/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    showToast('请输入正确的手机号')
    return
  }
  
  try {
    await authApi.sendSmsCode(phoneForm.phone)
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

const handlePhoneLogin = async () => {
  loading.value = true
  try {
    await userStore.login('phone', phoneForm)
    showToast('登录成功')
    router.replace('/home')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handlePasswordLogin = async () => {
  loading.value = true
  try {
    await userStore.login('password', passwordForm)
    showToast('登录成功')
    router.replace('/home')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.login-header {
  text-align: center;
  padding: 40px 0 30px;
  
  .logo {
    font-size: 60px;
  }
  
  h2 {
    font-size: 28px;
    color: #fff;
    margin: 10px 0 5px;
  }
  
  p {
    font-size: 14px;
    color: rgba(255,255,255,0.8);
    margin: 0;
  }
}

.login-tabs {
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding-top: 8px;
}

.footer {
  text-align: center;
  padding: 30px;
  font-size: 14px;
  color: #999;
  background: #fff;
  
  .register-link {
    color: #ff6b6b;
    margin-left: 4px;
  }
}
</style>
