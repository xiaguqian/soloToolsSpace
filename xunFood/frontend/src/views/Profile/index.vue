<template>
  <div class="page-container profile-page">
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
      </div>

      <div class="stats">
        <div class="stat-item clickable" @click="showMyRecipes = true">
          <div class="num">{{ user.recipeCount || 0 }}</div>
          <div class="label">菜谱</div>
        </div>
        <div class="stat-item clickable" @click="goToUserList('likes')">
          <div class="num">{{ user.likeCount || 0 }}</div>
          <div class="label">点赞</div>
        </div>
        <div class="stat-item clickable" @click="goToUserList('followers')">
          <div class="num">{{ user.followerCount || 0 }}</div>
          <div class="label">粉丝</div>
        </div>
        <div class="stat-item clickable" @click="goToUserList('followings')">
          <div class="num">{{ user.followingCount || 0 }}</div>
          <div class="label">关注</div>
        </div>
      </div>

      <div class="menu-list">
        <van-cell-group inset>
          <van-cell
            title="我的菜谱"
            is-link
            @click="showMyRecipes = true"
          >
            <template #icon>
              <van-icon name="notes-o" size="20" />
            </template>
          </van-cell>
          <van-cell
            title="我的收藏"
            is-link
            @click="$router.push('/favorites')"
          >
            <template #icon>
              <van-icon name="star-o" size="20" />
            </template>
          </van-cell>
          <van-cell title="设置" is-link @click="handleLogout">
            <template #icon>
              <van-icon name="setting-o" size="20" />
            </template>
            <template #value>
              <span class="logout-text">退出登录</span>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </div>

    <van-popup v-model:show="showMyRecipes" position="bottom" :style="{ height: '70%' }">
      <div class="popup-header">
        <h3>我的菜谱</h3>
        <van-icon name="cross" size="22" @click="showMyRecipes = false" />
      </div>
      <div class="popup-content">
        <div v-if="myRecipes.length === 0" class="empty-tip">
          <van-empty description="暂无菜谱" />
        </div>
        <div
          v-for="recipe in myRecipes"
          :key="recipe.id"
          class="recipe-item"
          @click="$router.push(`/recipe/${recipe.id}`)"
        >
          <img :src="recipe.cover || defaultCover" class="cover" />
          <div class="info">
            <div class="title">{{ recipe.title }}</div>
            <div class="meta">
              <span><van-icon name="good-job-o" /> {{ recipe.likeCount || 0 }}</span>
              <span><van-icon name="star-o" /> {{ recipe.favoriteCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </van-popup>

    <van-tabbar v-model="activeTabbar" route>
      <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>

    <div v-if="!user" class="not-logged-in">
      <van-empty description="请先登录" />
      <van-button type="primary" @click="$router.push('/login')">去登录</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import { recipeApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

const user = ref(null)
const myRecipes = ref([])
const showMyRecipes = ref(false)
const activeTabbar = ref(1)

const defaultAvatar = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent('可爱头像 卡通风格') + '&image_size=square'
const defaultCover = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent('美味食物 美食摄影 高清') + '&image_size=square'

const loadUser = async () => {
  if (!userStore.isLoggedIn()) {
    user.value = null
    return
  }
  await userStore.refreshUserInfo()
  user.value = userStore.userInfo
}

const loadMyRecipes = async () => {
  try {
    myRecipes.value = await recipeApi.getMyRecipes()
  } catch (e) {
    console.error(e)
  }
}

const handleLogout = () => {
  showConfirmDialog({
    title: '确认退出？',
    message: '退出后需要重新登录',
  }).then(() => {
    userStore.logout()
    user.value = null
    showToast('已退出登录')
    router.replace('/home')
  }).catch(() => {})
}

const goToUserList = (type) => {
  if (!user.value) return
  router.push({
    path: '/user-list',
    query: {
      type,
      id: user.value.id,
      name: user.value.nickname
    }
  })
}

watch(showMyRecipes, (val) => {
  if (val) {
    loadMyRecipes()
  }
})

onMounted(() => {
  loadUser()
})
</script>

<style lang="scss" scoped>
.profile-page {
  padding-bottom: 50px;
}

.header {
  display: flex;
  align-items: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  
  .info {
    margin-left: 20px;
    
    .name {
      font-size: 22px;
      color: #fff;
      margin: 0 0 8px;
    }
    
    .level-badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(255,255,255,0.3);
      border-radius: 12px;
      font-size: 12px;
      color: #fff;
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
    
    &.clickable {
      cursor: pointer;
    }
    
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

.menu-list {
  margin-top: 12px;
  
  .logout-text {
    color: #ff6b6b;
    font-size: 14px;
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  h3 {
    margin: 0;
    font-size: 16px;
  }
}

.popup-content {
  padding: 12px;
  max-height: calc(70vh - 60px);
  overflow-y: auto;
  
  .recipe-item {
    display: flex;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 12px;
    margin-bottom: 12px;
    
    .cover {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
      background: #e0e0e0;
    }
    
    .info {
      flex: 1;
      margin-left: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .title {
        font-size: 14px;
        font-weight: 600;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .meta {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: #999;
        
        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }
}

.empty-tip {
  padding: 40px 0;
}

.not-logged-in {
  padding-top: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
</style>
