<template>
  <div class="profile-page">
    <van-nav-bar title="我的" :arrow="false" />

    <div class="user-info card">
      <van-image
        :src="userInfo.avatar"
        width="64"
        height="64"
        round
      />
      <div class="user-detail">
        <div class="user-name">{{ userInfo.nickname }}</div>
        <div class="user-bio">{{ userInfo.bio }}</div>
      </div>
    </div>

    <van-cell-group inset>
      <van-cell
        title="个人图集"
        is-link
        @click="goGallery"
      >
        <template #icon>
          <van-icon name="photo-o" size="20" />
        </template>
        <template #right-icon>
          <span class="badge">{{ userInfo.galleryCount }}</span>
        </template>
      </van-cell>
      <van-cell
        title="个人收藏"
        is-link
        @click="goFavorites"
      >
        <template #icon>
          <van-icon name="star-o" size="20" />
        </template>
        <template #right-icon>
          <span class="badge">{{ userInfo.favoriteCount }}</span>
        </template>
      </van-cell>
      <van-cell
        title="智能云出行"
        is-link
        @click="goSmartTravel"
      >
        <template #icon>
          <van-icon name="cloud-o" size="20" />
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset>
      <van-cell
        title="我的出行计划"
        is-link
        @click="goPlans"
      >
        <template #icon>
          <van-icon name="todo-list-o" size="20" />
        </template>
        <template #right-icon>
          <span class="badge">{{ userInfo.planCount }}</span>
        </template>
      </van-cell>
      <van-cell
        title="我的出行笔记"
        is-link
        @click="goNotes"
      >
        <template #icon>
          <van-icon name="notes-o" size="20" />
        </template>
        <template #right-icon>
          <span class="badge">{{ userInfo.noteCount }}</span>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset>
      <van-cell
        title="设置"
        is-link
        @click="showSettings = true"
      >
        <template #icon>
          <van-icon name="setting-o" size="20" />
        </template>
      </van-cell>
      <van-cell
        title="关于我们"
        is-link
      >
        <template #icon>
          <van-icon name="info-o" size="20" />
        </template>
      </van-cell>
    </van-cell-group>

    <van-popup
      v-model:show="showSettings"
      round
      position="bottom"
      :style="{ height: 'auto' }"
    >
      <div class="settings-popup">
        <div class="popup-title">设置</div>
        <van-cell-group>
          <van-cell title="当前环境" :value="currentEnvText" />
        </van-cell-group>
        <div class="popup-tip">
          提示：当前环境为本地环境，使用本地模拟数据。切换环境请修改 src/config/env.js 文件。
        </div>
        <van-button
          type="primary"
          round
          block
          style="margin-top: 16px"
          @click="showSettings = false"
        >
          关闭
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfo } from '@/api/user'
import { getEnv } from '@/config/env'
import { showToast } from 'vant'

const router = useRouter()
const showSettings = ref(false)
const userInfo = ref({
  avatar: '',
  nickname: '',
  bio: '',
  galleryCount: 0,
  favoriteCount: 0,
  planCount: 0,
  noteCount: 0
})

const currentEnvText = computed(() => {
  const env = getEnv()
  const map = {
    local: '本地开发',
    dev: '开发环境',
    test: '测试环境',
    prod: '生产环境'
  }
  return map[env] || env
})

async function loadUserInfo() {
  try {
    const res = await getUserInfo()
    if (res.code === 0) {
      userInfo.value = res.data
    }
  } catch (error) {
    showToast('加载用户信息失败')
  }
}

function goGallery() {
  router.push('/gallery')
}

function goFavorites() {
  router.push('/favorites')
}

function goSmartTravel() {
  router.push('/smart-travel')
}

function goPlans() {
  router.push('/plans')
}

function goNotes() {
  router.push('/notes')
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.user-detail {
  flex: 1;
}

.user-name {
  font-size: 18px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 4px;
}

.user-bio {
  font-size: 13px;
  color: #969799;
}

.badge {
  display: inline-block;
  min-width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  font-size: 12px;
  color: #fff;
  background: #1989fa;
  border-radius: 10px;
  padding: 0 6px;
  margin-right: 8px;
}

.settings-popup {
  padding: 20px;
}

.popup-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  text-align: center;
}

.popup-tip {
  font-size: 12px;
  color: #969799;
  margin-top: 12px;
  line-height: 1.6;
}
</style>
