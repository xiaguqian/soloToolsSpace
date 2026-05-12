import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi, authApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const login = async (type, params) => {
    let result
    if (type === 'phone') {
      result = await authApi.loginByPhone(params.phone, params.code)
    } else {
      result = await authApi.loginByPassword(params.account, params.password)
    }
    
    token.value = result.token
    userInfo.value = result.user
    localStorage.setItem('token', result.token)
    localStorage.setItem('user', JSON.stringify(result.user))
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const refreshUserInfo = async () => {
    try {
      const user = await userApi.getCurrentUser()
      if (user) {
        userInfo.value = user
        localStorage.setItem('user', JSON.stringify(user))
      }
    } catch (e) {
      console.error('刷新用户信息失败', e)
    }
  }

  const isLoggedIn = () => !!token.value

  return {
    token,
    userInfo,
    login,
    logout,
    refreshUserInfo,
    isLoggedIn
  }
})
