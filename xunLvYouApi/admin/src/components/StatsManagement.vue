<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon scenic-icon">
            <el-icon><Location /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.scenicCount }}</div>
            <div class="stat-label">景点总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon view-icon">
            <el-icon><EyeIcon /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.scenicViews }}</div>
            <div class="stat-label">景点浏览量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon note-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.noteCount }}</div>
            <div class="stat-label">笔记总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon user-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.userCount }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon fav-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.noteFavorites }}</div>
            <div class="stat-label">笔记收藏量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon login-icon">
            <el-icon><LogIn /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.loginCount }}</div>
            <div class="stat-label">登录次数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card title="近6个月用户注册数">
          <div ref="userChart" style="height: 300px">
            <el-table :data="monthlyUsers" border style="width: 100%">
              <el-table-column prop="month" label="月份" />
              <el-table-column prop="count" label="注册数" />
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card title="近6个月登录次数">
          <div ref="loginChart" style="height: 300px">
            <el-table :data="monthlyLogins" border style="width: 100%">
              <el-table-column prop="month" label="月份" />
              <el-table-column prop="count" label="登录次数" />
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { Location, EyeIcon, Document, User, Star, LogIn } from '@element-plus/icons-vue'

const stats = reactive({
  scenicCount: 0,
  scenicViews: 0,
  noteCount: 0,
  noteFavorites: 0,
  userCount: 0,
  loginCount: 0
})

const monthlyUsers = ref([])
const monthlyLogins = ref([])

const loadStats = async () => {
  try {
    const response = await axios.get('/api/admin/stats')
    Object.assign(stats, response.data)
    monthlyUsers.value = response.data.monthlyUsers
    monthlyLogins.value = response.data.monthlyLogins
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
}
.scenic-icon {
  background-color: #e3f2fd;
  color: #1976d2;
}
.view-icon {
  background-color: #e8f5e9;
  color: #388e3c;
}
.note-icon {
  background-color: #fff3e0;
  color: #f57c00;
}
.user-icon {
  background-color: #f3e5f5;
  color: #7b1fa2;
}
.fav-icon {
  background-color: #e0f7fa;
  color: #00838f;
}
.login-icon {
  background-color: #fce4ec;
  color: #c2185b;
}
.stat-info {
  flex: 1;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.stat-label {
  font-size: 14px;
  color: #999;
}
</style>