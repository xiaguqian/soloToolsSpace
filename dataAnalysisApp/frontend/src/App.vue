<template>
  <el-container style="height: 100vh">
    <el-aside width="240px" style="background-color: #545c64">
      <div style="padding: 20px; color: #fff; font-size: 18px; font-weight: bold">
        数据分析应用
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="/">
          <el-icon><PieChart /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/dimensions">
          <el-icon><Grid /></el-icon>
          <span>维度管理</span>
        </el-menu-item>
        <el-menu-item index="/categories">
          <el-icon><Folder /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/data-definitions">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据定义</span>
        </el-menu-item>
        <el-menu-item index="/formulas">
          <el-icon><Calculator /></el-icon>
          <span>公式管理</span>
        </el-menu-item>
        <el-menu-item index="/query-statements">
          <el-icon><Search /></el-icon>
          <span>查询语句</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="text-align: right; font-size: 12px; border-bottom: 1px solid #eee">
        <span style="margin-right: 15px; color: #666">{{ currentTime }}</span>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentTime = ref('')
let timer = null

const activeMenu = computed(() => route.path)

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN')
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}

.el-aside {
  overflow: hidden;
}

.el-menu {
  border-right: none;
}

.el-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
