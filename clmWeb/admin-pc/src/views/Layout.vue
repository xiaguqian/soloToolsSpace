<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="logo">
        <h1>餐饮管理</h1>
      </div>
      <el-menu :default-active="activeMenu" class="sidebar-menu" router>
        <el-menu-item index="/dashboard">
          <el-icon><component :is="icons.LayoutDashboard" /></el-icon>
          <span>数据看板</span>
        </el-menu-item>
        <el-menu-item index="/product">
          <el-icon><component :is="icons.Shop" /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/category">
          <el-icon><component :is="icons.Folder" /></el-icon>
          <span>商品分类</span>
        </el-menu-item>
        <el-menu-item index="/table">
          <el-icon><component :is="icons.QrCode" /></el-icon>
          <span>桌码管理</span>
        </el-menu-item>
        <el-menu-item index="/order">
          <el-icon><component :is="icons.ShoppingCart" /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><component :is="icons.Setting" /></el-icon>
          <span>店铺设置</span>
        </el-menu-item>
      </el-menu>
    </aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ breadcrumbName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <span class="user-info">{{ user.name }}</span>
          <el-button type="text" @click="handleLogout">退出登录</el-button>
        </div>
      </header>
      <div class="content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  LayoutDashboard, 
  Shop, 
  Folder, 
  QrCode, 
  ShoppingCart, 
  Setting 
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const icons = {
  LayoutDashboard,
  Shop,
  Folder,
  QrCode,
  ShoppingCart,
  Setting
}

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

const activeMenu = computed(() => route.path)

const breadcrumbName = computed(() => {
  const names = {
    '/dashboard': '数据看板',
    '/product': '商品管理',
    '/category': '商品分类',
    '/table': '桌码管理',
    '/order': '订单管理',
    '/settings': '店铺设置'
  }
  return names[route.path] || ''
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  ElMessage.success('退出成功')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 200px;
  background: linear-gradient(180deg, #2c3e50 0%, #1a252f 100%);
  color: white;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #34495e;
}

.logo h1 {
  font-size: 18px;
  margin: 0;
  color: #fff;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.sidebar-menu :deep(.el-menu-item) {
  color: #b8c7ce;
  height: 50px;
  line-height: 50px;
  margin: 0 10px;
  border-radius: 6px;
  margin-bottom: 5px;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: #3498db;
  color: #fff;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.header {
  background: white;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  color: #666;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
