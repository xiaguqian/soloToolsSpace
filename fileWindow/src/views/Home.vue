<template>
  <div class="home-container">
    <div class="sidebar">
      <div class="logo-section">
        <div class="logo">📁</div>
        <h2>文档管理</h2>
      </div>
      <div class="nav-section">
        <div 
          class="nav-item" 
          :class="{ active: store.state.activeTab === 'directories' }"
          @click="store.setActiveTab('directories')"
        >
          <span class="nav-icon">📂</span>
          <span>常用目录</span>
        </div>
        <div 
          class="nav-item" 
          :class="{ active: store.state.activeTab === 'files' }"
          @click="store.setActiveTab('files')"
        >
          <span class="nav-icon">📄</span>
          <span>常用文件</span>
        </div>
        <div class="nav-divider"></div>
        <div 
          class="nav-item" 
          @click="$router.push('/batch-create')"
        >
          <span class="nav-icon">📦</span>
          <span>批量创建</span>
        </div>
        <div 
          class="nav-item" 
          @click="$router.push('/statistics')"
        >
          <span class="nav-icon">📊</span>
          <span>数据统计</span>
        </div>
        <div 
          class="nav-item" 
          @click="$router.push('/settings')"
        >
          <span class="nav-icon">⚙️</span>
          <span>设置</span>
        </div>
      </div>
      <div class="footer-section">
        <div class="footer-item" @click="openEditor">
          <span class="nav-icon">✏️</span>
          <span>新建文档</span>
        </div>
      </div>
    </div>
    
    <div class="main-content">
      <transition name="slide" mode="out-in">
        <DirectoryManager v-if="store.state.activeTab === 'directories'" key="dirs" />
        <FileManager v-else key="files" />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { useStore } from '../store'
import DirectoryManager from '../components/DirectoryManager.vue'
import FileManager from '../components/FileManager.vue'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

function openEditor() {
  router.push('/editor')
}
</script>

<style scoped>
.home-container {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}

.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  display: flex;
  flex-direction: column;
  color: #fff;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
}

.logo-section {
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo {
  font-size: 40px;
  margin-bottom: 8px;
}

.logo-section h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.nav-section {
  flex: 1;
  padding: 16px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.nav-item:hover {
  background: rgba(255,255,255,0.1);
}

.nav-item.active {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.nav-icon {
  margin-right: 12px;
  font-size: 18px;
}

.nav-divider {
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: 16px 16px;
}

.footer-section {
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.footer-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  background: rgba(102, 126, 234, 0.2);
}

.footer-item:hover {
  background: rgba(102, 126, 234, 0.4);
}

.main-content {
  flex: 1;
  overflow: hidden;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
