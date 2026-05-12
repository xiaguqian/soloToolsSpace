<template>
  <div class="page-container user-profile-page">
    <van-nav-bar :title="user?.nickname || '用户主页'" left-arrow @click-left="$router.back()" />

    <div v-if="user" class="profile-content">
      <div class="header">
        <van-image
          round
          width="80"
          height="80"
          :src="user.avatar || defaultAvatar"
        />
        <div class="info">
          <h2 class="name">{{ user.nickname || user.username }}</h2>
          <div class="level-badge">{{ user.levelName }}</div>
        </div>
        <van-button
          v-if="!isSelf"
          :type="user.followed ? 'default' : 'primary'"
          size="small"
          @click="toggleFollow"
        >
          {{ user.followed ? '已关注' : '+ 关注' }}
        </van-button>
      </div>

      <div class="stats">
        <div class="stat-item">
          <div class="num">{{ user.recipeCount || 0 }}</div>
          <div class="label">菜谱</div>
        </div>
        <div class="stat-item">
          <div class="num">{{ user.likeCount || 0 }}</div>
          <div class="label">点赞</div>
        </div>
        <div class="stat-item">
          <div class="num">{{ user.followerCount || 0 }}</div>
          <div class="label">粉丝</div>
        </div>
        <div class="stat-item">
          <div class="num">{{ user.followingCount || 0 }}</div>
          <div class="label">关注</div>
        </div>
      </div>

      <div class="section" v-if="user.bio">
        <h3 class="section-title">简介</h3>
        <p class="bio">{{ user.bio }}</p>
      </div>
    </div>

    <van-loading v-if="loading" class="loading" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { userApi } from '@/api'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

const user = ref(null)
const loading = ref(true)

const isSelf = computed(() => {
  return userStore.userInfo && user.value && userStore.userInfo.id === user.value.id
})

const defaultAvatar = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent('可爱头像 卡通风格') + '&image_size=square'

const loadUser = async () => {
  loading.value = true
  try {
    user.value = await userApi.getUserById(route.params.id)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const toggleFollow = async () => {
  if (!userStore.isLoggedIn()) {
    return
  }
  try {
    if (user.value.followed) {
      await userApi.unfollow(user.value.id)
    } else {
      await userApi.follow(user.value.id)
    }
    user.value.followed = !user.value.followed
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadUser()
})
</script>

<style lang="scss" scoped>
.user-profile-page {
  padding-bottom: 0;
}

.header {
  display: flex;
  align-items: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  
  .info {
    flex: 1;
    margin-left: 20px;
    
    .name {
      font-size: 22px;
      color: #333;
      margin: 0 0 8px;
    }
    
    .level-badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(255,255,255,0.6);
      border-radius: 12px;
      font-size: 12px;
      color: #ff6b6b;
    }
  }
}

.stats {
  display: flex;
  background: #fff;
  padding: 20px 0;
  
  .stat-item {
    flex: 1;
    text-align: center;
    
    .num {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    
    .label {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
  }
}

.section {
  background: #fff;
  margin-top: 12px;
  padding: 16px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px;
  }
  
  .bio {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin: 0;
  }
}

.loading {
  display: flex;
  justify-content: center;
  margin-top: 100px;
}
</style>
