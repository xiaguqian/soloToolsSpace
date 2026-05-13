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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfo } from '@/api/user'
import { showToast } from 'vant'

const router = useRouter()
const userInfo = ref({
  avatar: '',
  nickname: '',
  bio: '',
  galleryCount: 0,
  favoriteCount: 0,
  planCount: 0,
  noteCount: 0
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
</style>
