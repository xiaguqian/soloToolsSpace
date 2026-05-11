<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-left">
        <el-icon :size="28" color="#409EFF"><Bug /></el-icon>
        <h1 class="app-title">可视化爬虫搭建平台</h1>
      </div>
      <div class="header-right">
        <el-tag type="success">服务运行中</el-tag>
      </div>
    </el-header>
    <el-container>
      <el-aside width="220px" class="app-aside">
        <el-menu
          :default-active="activeMenu"
          class="aside-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/tasks">
            <el-icon><Document /></el-icon>
            <span>爬虫管理</span>
          </el-menu-item>
          <el-menu-item index="/components">
            <el-icon><Grid /></el-icon>
            <span>组件管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)

const handleMenuSelect = (index) => {
  router.push(index)
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
}

.app-container {
  height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-title {
  color: white;
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.app-aside {
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
}

.aside-menu {
  border-right: none;
}

.app-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
