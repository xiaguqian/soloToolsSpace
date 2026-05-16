<template>
  <div class="page-container user-list-page">
    <van-nav-bar :title="pageTitle" left-arrow @click-left="$router.back()" />

    <div class="user-list">
      <div
        v-for="user in users"
        :key="user.id"
        class="user-item"
        @click="$router.push(`/user/${user.id}`)"
      >
        <van-image
          round
          width="50"
          height="50"
          :src="user.avatar || defaultAvatar"
        />
        <div class="info">
          <div class="name">{{ user.nickname || user.username }}</div>
          <div class="level">{{ user.levelName }}</div>
        </div>
        <van-button
          v-if="showFollowButton && !isCurrentUser(user)"
          :type="user.followed ? 'default' : 'primary'"
          size="small"
          @click.stop="toggleFollow(user)"
        >
          {{ user.followed ? '已关注' : '+ 关注' }}
        </van-button>
      </div>

      <van-empty v-if="!loading && users.length === 0" :description="emptyText" />
    </div>

    <van-loading v-if="loading" class="loading" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { userApi, recipeApi } from '@/api'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

const users = ref([])
const loading = ref(true)

const defaultAvatar = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent('可爱头像 卡通风格') + '&image_size=square'

const listType = computed(() => route.query.type || 'followers')
const targetId = computed(() => route.query.id)
const targetName = computed(() => route.query.name || '')

const pageTitle = computed(() => {
  const titles = {
    followers: '粉丝',
    followings: '关注',
    likes: '点赞的人',
    favorites: '收藏的人'
  }
  return titles[listType.value] || '用户列表'
})

const emptyText = computed(() => {
  const texts = {
    followers: '暂无粉丝',
    followings: '暂无关注',
    likes: '暂无人点赞',
    favorites: '暂无人收藏'
  }
  return texts[listType.value] || '暂无数据'
})

const showFollowButton = computed(() => {
  return listType.value === 'followers' || listType.value === 'followings'
})

const isCurrentUser = (user) => {
  return userStore.userInfo && userStore.userInfo.id === user.id
}

const loadUsers = async () => {
  loading.value = true
  try {
    let data = []
    if (listType.value === 'followers') {
      data = await userApi.getFollowers(targetId.value)
    } else if (listType.value === 'followings') {
      data = await userApi.getFollowings(targetId.value)
    } else if (listType.value === 'likes') {
      data = await recipeApi.getLikedUsers(targetId.value)
    } else if (listType.value === 'favorites') {
      data = await recipeApi.getFavoritedUsers(targetId.value)
    }
    users.value = data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const toggleFollow = async (user) => {
  if (!userStore.isLoggedIn()) {
    return
  }
  try {
    if (user.followed) {
      await userApi.unfollow(user.id)
    } else {
      await userApi.follow(user.id)
    }
    user.followed = !user.followed
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style lang="scss" scoped>
.user-list-page {
  padding-bottom: 0;
}

.user-list {
  padding: 12px;
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
  margin-top: 100px;
}
</style>
