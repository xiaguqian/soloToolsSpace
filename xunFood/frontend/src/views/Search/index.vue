<template>
  <div class="page-container search-page">
    <van-nav-bar left-arrow @click-left="$router.back()">
      <template #title>
        <van-search
          v-model="keyword"
          placeholder="搜索菜谱、用户"
          show-action
          @search="onSearch"
          @cancel="$router.back()"
        />
      </template>
    </van-nav-bar>

    <van-tabs v-model:active="activeTab">
      <van-tab title="菜谱" name="recipe">
        <div class="result-list">
          <div
            v-for="recipe in searchResult.recipes"
            :key="recipe.id"
            class="recipe-item"
            @click="$router.push(`/recipe/${recipe.id}`)"
          >
            <img :src="recipe.cover || defaultCover" class="cover" />
            <div class="info">
              <div class="title">{{ recipe.title }}</div>
              <div class="meta">
                <span>{{ recipe.author?.nickname }}</span>
                <span class="stats">
                  <van-icon name="good-job-o" /> {{ recipe.likeCount || 0 }}
                </span>
              </div>
            </div>
          </div>
          <van-empty v-if="!searching && searchResult.recipes.length === 0" description="暂无相关菜谱" />
        </div>
      </van-tab>
      <van-tab title="用户" name="user">
        <div class="result-list">
          <div
            v-for="user in searchResult.users"
            :key="user.id"
            class="user-item"
            @click="$router.push(`/user/${user.id}`)"
          >
            <van-image
              round
              width="48"
              height="48"
              :src="user.avatar || defaultAvatar"
            />
            <div class="info">
              <div class="name">{{ user.nickname || user.username }}</div>
              <div class="level">{{ user.levelName }}</div>
            </div>
          </div>
          <van-empty v-if="!searching && searchResult.users.length === 0" description="暂无相关用户" />
        </div>
      </van-tab>
    </van-tabs>

    <van-loading v-if="searching" class="loading" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { searchApi } from '@/api'

const keyword = ref('')
const activeTab = ref('recipe')
const searching = ref(false)
const searchResult = ref({ recipes: [], users: [] })

const defaultCover = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent('美味食物 美食摄影 高清') + '&image_size=square'
const defaultAvatar = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent('可爱头像 卡通风格') + '&image_size=square'

const onSearch = async () => {
  if (!keyword.value.trim()) {
    searchResult.value = { recipes: [], users: [] }
    return
  }
  
  searching.value = true
  try {
    searchResult.value = await searchApi.searchAll(keyword.value.trim())
  } catch (e) {
    console.error(e)
  } finally {
    searching.value = false
  }
}

watch(keyword, (val) => {
  if (!val.trim()) {
    searchResult.value = { recipes: [], users: [] }
  }
})
</script>

<style lang="scss" scoped>
.search-page {
  padding-top: 46px;
}

.result-list {
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
      display: flex;
      align-items: center;
      justify-content: space-between;
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

.user-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  
  .info {
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
      margin-top: 4px;
    }
  }
}

.loading {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}
</style>
