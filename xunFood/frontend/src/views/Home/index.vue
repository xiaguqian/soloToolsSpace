<template>
  <div class="page-container home-page">
    <van-nav-bar title="今日推荐">
      <template #right>
        <van-icon name="search" size="22" @click="$router.push('/search')" />
      </template>
    </van-nav-bar>

    <van-swipe class="banner" :autoplay="3000" indicator-color="#fff">
      <van-swipe-item v-for="(item, index) in banners" :key="index">
        <div class="banner-item" :style="{ background: item.color }">
          <div class="banner-text">{{ item.text }}</div>
        </div>
      </van-swipe-item>
    </van-swipe>

    <van-tabs v-model:active="activeTab" class="recipe-tabs" @change="onTabChange">
      <van-tab title="推荐" name="recommend" />
      <van-tab title="点击榜" name="like" />
      <van-tab title="收藏榜" name="favorite" />
    </van-tabs>

    <div class="recipe-content">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadMore"
      >
        <div :class="activeTab === 'recommend' ? 'waterfall-grid' : 'single-column'">
          <div
            v-for="recipe in recipeList"
            :key="recipe.id"
            class="recipe-card"
            @click="$router.push(`/recipe/${recipe.id}`)"
          >
            <img
              :src="recipe.cover || getDefaultCover()"
              class="cover"
              :class="{ 'double-column': activeTab === 'recommend' }"
            />
            <div class="info">
              <div class="title">{{ recipe.title }}</div>
              <div class="meta">
                <span>{{ recipe.author?.nickname || '未知作者' }}</span>
                <span class="stats">
                  <van-icon name="good-job-o" /> {{ recipe.likeCount || 0 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </div>

    <van-tabbar v-model="activeTabbar" route>
      <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { recipeApi } from '@/api'

const banners = [
  { text: '唯有爱与美食不可辜负', color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { text: '用心烹饪每一道菜', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { text: '发现生活的美味', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }
]

const activeTab = ref('recommend')
const activeTabbar = ref(0)
const recipeList = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10

const loadMore = async () => {
  if (loading.value) return
  loading.value = true
  
  try {
    const result = await recipeApi.getList(activeTab.value, page.value, pageSize)
    if (result.records && result.records.length > 0) {
      recipeList.value = [...recipeList.value, ...result.records]
      page.value++
    }
    if (!result.records || result.records.length < pageSize) {
      finished.value = true
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const onTabChange = () => {
  recipeList.value = []
  page.value = 1
  finished.value = false
  loadMore()
}

const getDefaultCover = () => {
  const colors = ['#ff9a9e', '#a8edea', '#ffecd2', '#d299c2', '#fef9d7']
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('美味食物 美食摄影 高清')}&image_size=square`
}

onMounted(() => {
  loadMore()
})
</script>

<style lang="scss" scoped>
.home-page {
  padding-top: 46px;
}

.banner {
  height: 160px;
  
  .banner-item {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .banner-text {
    font-size: 24px;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 2px 10px rgba(0,0,0,0.15);
  }
}

.recipe-tabs {
  background: #fff;
  position: sticky;
  top: 46px;
  z-index: 10;
}

.recipe-content {
  padding: 12px;
}

.waterfall-grid {
  column-count: 2;
  column-gap: 12px;
  
  .recipe-card {
    break-inside: avoid;
    
    .cover {
      height: 160px;
    }
  }
}

.single-column {
  .recipe-card {
    display: flex;
    padding: 12px;
    
    .cover {
      width: 120px;
      height: 120px;
      border-radius: 8px;
      flex-shrink: 0;
    }
    
    .info {
      flex: 1;
      margin-left: 12px;
      padding: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }
}

.recipe-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  .cover {
    width: 100%;
    display: block;
    object-fit: cover;
    background: #f0f0f0;
  }
  
  .info {
    padding: 10px;
    
    .title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 12px;
      color: #999;
      
      .stats {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}
</style>
