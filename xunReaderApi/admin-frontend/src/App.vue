<template>
  <el-container class="app-container">
    <el-aside width="200px" class="sidebar">
      <el-menu :default-active="$route.path" class="sidebar-menu" router>
        <el-menu-item index="/books">
          <el-icon><Book /></el-icon>
          <span>书籍管理</span>
        </el-menu-item>
        <el-menu-item index="/writing">
          <el-icon><Edit /></el-icon>
          <span>写作中心</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/roles">
          <el-icon><Lock /></el-icon>
          <span>权限管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <h1>小说阅读器管理台</h1>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { Book, Edit, User, Lock } from '@element-plus/icons-vue'
</script>

<style>
.app-container {
  height: 100vh;
}

.sidebar {
  background-color: #2a3f5f;
}

.sidebar-menu {
  height: 100%;
  border-right: none;
}

.sidebar-menu :deep(.el-menu-item) {
  color: #fff;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #1a273a;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

.header h1 {
  font-size: 18px;
  margin: 0;
  color: #333;
}

.main-content {
  padding: 20px;
}
</style>