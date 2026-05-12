import { defineStore } from 'pinia'
import { login, getCurrentUser } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('user') || 'null')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userInfo?.role === 'admin',
    isTeamAdmin: (state) => state.userInfo?.role === 'team_admin' || state.userInfo?.role === 'admin'
  },

  actions: {
    async login(credentials) {
      const response = await login(credentials)
      this.token = response.data.access_token
      localStorage.setItem('token', this.token)
      await this.fetchUserInfo()
    },

    async fetchUserInfo() {
      const response = await getCurrentUser()
      this.userInfo = response.data
      localStorage.setItem('user', JSON.stringify(this.userInfo))
    },

    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
