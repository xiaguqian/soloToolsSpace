<template>
  <div class="page-container recipe-detail-page">
    <van-nav-bar title="菜谱详情" left-arrow @click-left="$router.back()" />

    <div v-if="recipe" class="recipe-content">
      <img :src="recipe.cover || defaultCover" class="cover" />

      <div class="author-bar" @click="goToAuthor">
        <van-image
          round
          width="48"
          height="48"
          :src="recipe.author?.avatar || defaultAvatar"
        />
        <div class="author-info">
          <div class="name">{{ recipe.author?.nickname || '美食达人' }}</div>
          <div class="level">{{ recipe.author?.levelName }}</div>
        </div>
        <van-button
          v-if="!isSelf"
          :type="recipe.author?.followed ? 'default' : 'primary'"
          size="small"
          @click.stop="toggleFollow"
        >
          {{ recipe.author?.followed ? '已关注' : '+ 关注' }}
        </van-button>
      </div>

      <div class="recipe-info">
        <h2 class="title">{{ recipe.title }}</h2>
        <p class="desc" v-if="recipe.description">{{ recipe.description }}</p>
        <div class="tags">
          <van-tag plain type="primary">{{ getDifficulty(recipe.difficulty) }}</van-tag>
          <van-tag plain type="success">{{ recipe.cookTime }}分钟</van-tag>
          <van-tag plain type="warning">{{ recipe.serving }}人份</van-tag>
        </div>
      </div>

      <div class="section" v-if="recipe.ingredientList?.length">
        <h3 class="section-title">食材</h3>
        <div class="ingredients">
          <div class="ingredient-item" v-for="(item, idx) in recipe.ingredientList" :key="idx">
            <span class="name">{{ item.name }}</span>
            <span class="amount">{{ item.amount }}</span>
          </div>
        </div>
      </div>

      <div class="section" v-if="recipe.stepList?.length">
        <h3 class="section-title">步骤</h3>
        <div class="steps">
          <div class="step-item" v-for="step in recipe.stepList" :key="step.order">
            <div class="step-order">{{ step.order }}</div>
            <div class="step-content">
              <img v-if="step.image" :src="step.image" class="step-image" />
              <p class="step-desc">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div style="height: 80px"></div>
    </div>

    <div class="action-bar" v-if="recipe">
      <div class="action-item">
        <van-icon 
          :name="recipe.liked ? 'good-job' : 'good-job-o'" 
          :color="recipe.liked ? '#ff6b6b' : '#999'" 
          @click="toggleLike"
        />
        <span 
          class="count-clickable" 
          :class="{ active: recipe.liked }" 
          @click="goToUserList('likes')"
        >
          {{ recipe.likeCount || 0 }}
        </span>
      </div>
      <div class="action-item">
        <van-icon 
          :name="recipe.favorited ? 'star' : 'star-o'" 
          :color="recipe.favorited ? '#ffc107' : '#999'" 
          @click="toggleFavorite"
        />
        <span 
          class="count-clickable" 
          :class="{ active: recipe.favorited }" 
          @click="goToUserList('favorites')"
        >
          {{ recipe.favoriteCount || 0 }}
        </span>
      </div>
      <van-button type="primary" block class="start-btn" @click="startCooking">
        开始做菜
      </van-button>
    </div>

    <van-loading v-if="loading" class="loading" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { recipeApi, userApi } from '@/api'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const recipe = ref(null)
const loading = ref(true)

const isSelf = computed(() => {
  return userStore.userInfo && recipe.value?.author && 
         userStore.userInfo.id === recipe.value.author.id
})

const defaultCover = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent('美味食物 美食摄影 高清') + '&image_size=square_hd'
const defaultAvatar = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent('可爱头像 卡通风格') + '&image_size=square'

const loadRecipe = async () => {
  loading.value = true
  try {
    recipe.value = await recipeApi.getDetail(route.params.id)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const getDifficulty = (level) => {
  const map = { 1: '简单', 2: '中等', 3: '困难' }
  return map[level] || '简单'
}

const toggleLike = async () => {
  if (!userStore.isLoggedIn()) {
    router.push('/login')
    return
  }
  try {
    await recipeApi.toggleLike(route.params.id)
    recipe.value.liked = !recipe.value.liked
    recipe.value.likeCount = (recipe.value.likeCount || 0) + (recipe.value.liked ? 1 : -1)
  } catch (e) {
    console.error(e)
  }
}

const toggleFavorite = async () => {
  if (!userStore.isLoggedIn()) {
    router.push('/login')
    return
  }
  try {
    await recipeApi.toggleFavorite(route.params.id)
    recipe.value.favorited = !recipe.value.favorited
    recipe.value.favoriteCount = (recipe.value.favoriteCount || 0) + (recipe.value.favorited ? 1 : -1)
  } catch (e) {
    console.error(e)
  }
}

const toggleFollow = async () => {
  if (!userStore.isLoggedIn()) {
    router.push('/login')
    return
  }
  try {
    if (recipe.value.author.followed) {
      await userApi.unfollow(recipe.value.author.id)
    } else {
      await userApi.follow(recipe.value.author.id)
    }
    recipe.value.author.followed = !recipe.value.author.followed
  } catch (e) {
    console.error(e)
  }
}

const startCooking = () => {
  if (!userStore.isLoggedIn()) {
    router.push('/login')
    return
  }
  router.push(`/cook/${route.params.id}`)
}

const goToAuthor = () => {
  if (recipe.value?.author) {
    router.push(`/user/${recipe.value.author.id}`)
  }
}

const goToUserList = (type) => {
  if (!recipe.value) return
  router.push({
    path: '/user-list',
    query: {
      type,
      id: recipe.value.id,
      name: recipe.value.title
    }
  })
}

onMounted(() => {
  loadRecipe()
})
</script>

<style lang="scss" scoped>
.recipe-detail-page {
  padding-bottom: 0;
}

.cover {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.author-bar {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fff;
  
  .author-info {
    flex: 1;
    margin-left: 12px;
    
    .name {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
    
    .level {
      font-size: 12px;
      color: #ff6b6b;
      margin-top: 2px;
    }
  }
}

.recipe-info {
  background: #fff;
  padding: 0 16px 16px;
  
  .title {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin: 0;
  }
  
  .desc {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin-top: 8px;
  }
  
  .tags {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
}

.section {
  background: #fff;
  margin-top: 12px;
  padding: 16px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 12px 0;
  }
}

.ingredients {
  .ingredient-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .name {
      color: #333;
    }
    
    .amount {
      color: #999;
    }
  }
}

.steps {
  .step-item {
    display: flex;
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .step-order {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #ff6b6b;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;
    }
    
    .step-content {
      flex: 1;
      margin-left: 12px;
      
      .step-image {
        width: 100%;
        border-radius: 8px;
        margin-bottom: 8px;
      }
      
      .step-desc {
        font-size: 14px;
        color: #333;
        line-height: 1.6;
        margin: 0;
      }
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 20px;
    
    .van-icon {
      cursor: pointer;
    }
    
    .count-clickable {
      font-size: 12px;
      color: #999;
      margin-top: 2px;
      cursor: pointer;
      
      &.active {
        color: #ff6b6b;
      }
    }
  }
  
  .start-btn {
    flex: 1;
    border-radius: 20px;
  }
}

.loading {
  display: flex;
  justify-content: center;
  margin-top: 100px;
}
</style>
