<template>
  <div v-if="!isLoggedIn">
    <Login @login="handleLogin" />
  </div>
  <div v-else>
    <el-container style="height: 100vh; border: 1px solid #eee">
      <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
        <el-menu :default-active="activeMenu" class="el-menu-vertical-demo" @select="handleMenuSelect">
          <el-menu-item index="scenic">
            <el-icon><Location /></el-icon>
            <span>景点管理</span>
          </el-menu-item>
          <el-menu-item index="note">
            <el-icon><Document /></el-icon>
            <span>笔记管理</span>
          </el-menu-item>
          <el-menu-item index="stats">
            <el-icon><BarChart /></el-icon>
            <span>数据统计</span>
          </el-menu-item>
          <el-menu-item index="logout" @click="handleLogout">
            <el-icon><LogOut /></el-icon>
            <span>退出登录</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header style="text-align: right; font-size: 12px">
          <span>巡旅游管理台</span>
        </el-header>
        <el-main>
          <ScenicManagement v-if="activeMenu === 'scenic'" />
          <NoteManagement v-if="activeMenu === 'note'" />
          <StatsManagement v-if="activeMenu === 'stats'" />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Location, Document, BarChart, LogOut } from '@element-plus/icons-vue'
import Login from './components/Login.vue'
import ScenicManagement from './components/ScenicManagement.vue'
import NoteManagement from './components/NoteManagement.vue'
import StatsManagement from './components/StatsManagement.vue'

const isLoggedIn = ref(false)
const activeMenu = ref('scenic')

const handleLogin = () => {
  isLoggedIn.value = true
}

const handleMenuSelect = (index) => {
  if (index !== 'logout') {
    activeMenu.value = index
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  isLoggedIn.value = false
}

onMounted(() => {
  if (localStorage.getItem('token')) {
    isLoggedIn.value = true
  }
})
</script>

<style>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}
.el-aside {
  color: #333;
}
</style>