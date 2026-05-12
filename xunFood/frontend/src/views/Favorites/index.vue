<template>
  <div class="page-container favorites-page">
    <van-nav-bar title="我的收藏" left-arrow @click-left="$router.back()" />

    <div class="favorites-list">
      <div
        v-for="recipe in recipes"
        :key="recipe.id"
        class="recipe-item"
        @click="$router.push(`/recipe/${recipe.id}`)"
      >
        <img :src="recipe.cover || defaultCover" class="cover" />
        <div class="info">
          <div class="title">{{ recipe.title }}</div>
          <div class="meta">
            <span>{{ recipe.author?.nickname }}</span>
            <div class="stats">
              <span><van-icon name="good-job-o" /> {{ recipe.likeCount || 0 }}</span>
              <span><van-icon name="star-o" /> {{ recipe.favoriteCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <van-empty v-if="!loading && recipes.length === 0" description="暂无收藏" />
    </div>

    <van-loading v-if="loading" class="loading" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { recipeApi } from '@/api'

const recipes = ref([])
const loading = ref(true)

const defaultCover = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent('美味食物 美食摄影 高清') + '&image_size=square'

const loadFavorites = async () => {
  loading.value = true
  try {
    recipes.value = await recipeApi.getMyFavorites()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFavorites()
})
</script>

<style lang="scss" scoped>
.favorites-page {
  padding-bottom: 0;
}

.favorites-list {
  padding: 12px;
}

.recipe-item {
  display: flex;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  
  .cover {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
    background: #f0f0f0;
  }
  
  .info {
    flex: 1;
    margin-left: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .meta {
      .stats {
        display: flex;
        gap: 12px;
        margin-top: 8px;
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

.loading {
  display: flex;
  justify-content: center;
  margin-top: 100px;
}
</style>
