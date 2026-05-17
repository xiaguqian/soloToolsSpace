<template>
  <div class="layout">
    <aside :class="{ 'collapse': isCollapse }" class="sidebar">
      <div class="logo">
        <img :src="tenant?.logo || 'https://via.placeholder.com/40'" alt="Logo" />
        <span v-if="!isCollapse">{{ tenant?.name }}</span>
      </div>
      <el-menu :default-active="activeMenu" mode="vertical">
        <el-menu-item index="/">
          <el-icon><component :is="Dashboard" /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/products">
          <el-icon><component :is="ShoppingCart" /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><component :is="List" /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><component :is="User" /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/statistics">
          <el-icon><component :is="BarChart3" /></el-icon>
          <span>数据统计</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><component :is="Settings" /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
      <div class="collapse-btn" @click="isCollapse = !isCollapse">
        <el-icon>{{ isCollapse ? ChevronRight : ChevronLeft }}</el-icon>
      </div>
    </aside>
    
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <span class="menu-btn" @click="isCollapse = !isCollapse">
            <el-icon><component :is="Menu" /></el-icon>
          </span>
        </div>
        <div class="header-right">
          <span class="user-info">{{ user?.name }}</span>
          <el-button type="text" @click="logout">
            <el-icon><component :is="Logout" /></el-icon>
            <span>退出</span>
          </el-button>
        </div>
      </header>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Dashboard, ShoppingCart, List, User, BarChart3, Settings, 
  ChevronLeft, ChevronRight, Menu, Logout 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { authApi } from '../api'

const isCollapse = ref(false)
const user = ref(null)
const tenant = ref(null)

const activeMenu = computed(() => {
  return window.location.pathname
})

const logout = async () => {
  try {
    await authApi.logout()
  } catch (e) {}
  
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('tenant')
  ElMessage.success('退出成功')
  window.location.href = '/login'
}

onMounted(() => {
  user.value = JSON.parse(localStorage.getItem('user') || '{}')
  tenant.value = JSON.parse(localStorage.getItem('tenant') || '{}')
})
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 200px;
  background: #2f4050;
  color: white;
  position: fixed;
  height: 100vh;
  transition: width 0.3s;
}

.sidebar.collapse {
  width: 60px;
}

.logo {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #1f2d3d;
}

.logo img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.logo span {
  font-size: 16px;
  font-weight: bold;
}

.el-menu {
  border-right: none;
  background: transparent;
}

.el-menu-item {
  color: #a7b1c2;
  height: 50px;
  line-height: 50px;
}

.el-menu-item:hover, .el-menu-item.is-active {
  background: #1f2d3d;
  color: white;
}

.collapse-btn {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background: #1f2d3d;
  border-radius: 50%;
  cursor: pointer;
}

.main-content {
  flex: 1;
  margin-left: 200px;
  transition: margin-left 0.3s;
}

.sidebar.collapse + .main-content {
  margin-left: 60px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e6e6e6;
}

.menu-btn {
  font-size: 20px;
  cursor: pointer;
  display: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  color: #666;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    z-index: 100;
  }
  
  .sidebar.collapse {
    transform: translateX(0);
    width: 200px;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .menu-btn {
    display: block;
  }
}
</style>