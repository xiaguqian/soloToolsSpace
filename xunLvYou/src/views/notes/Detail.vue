<template>
  <div class="note-detail">
    <van-nav-bar
      title="笔记详情"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    >
      <template #right>
        <van-icon :name="isFavorited ? 'star' : 'star-o'" @click="toggleFavorite" />
      </template>
    </van-nav-bar>

    <van-loading v-if="loading" class="loading-center" />

    <div v-else-if="note" class="detail-content">
      <h1 class="note-title">{{ note.title }}</h1>
      
      <div class="note-author">
        <van-image
          :src="note.authorAvatar"
          width="40"
          height="40"
          round
        />
        <div class="author-info">
          <div class="author-name">{{ note.author }}</div>
          <div class="create-time">{{ note.createTime }}</div>
        </div>
      </div>

      <div class="note-scenic">
        <van-tag type="primary" plain>
          <van-icon name="location-o" />
          {{ note.scenicName }}
        </van-tag>
      </div>

      <div class="note-images">
        <van-image
          v-for="(img, index) in note.images"
          :key="index"
          :src="img"
          width="100%"
          fit="cover"
          radius="12"
          class="note-image"
        />
      </div>

      <div class="note-content-text">{{ note.content }}</div>

      <div class="note-stats">
        <div class="stat-item">
          <van-icon name="like-o" />
          <span>{{ note.likeCount }}</span>
        </div>
        <div class="stat-item">
          <van-icon name="comment-o" />
          <span>{{ note.commentCount }}</span>
        </div>
        <div class="stat-item">
          <van-icon name="star-o" />
          <span>{{ note.favoriteCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getNoteDetail, favoriteNote, unfavoriteNote } from '@/api/note'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const note = ref(null)
const isFavorited = ref(false)

async function loadNoteDetail() {
  try {
    const res = await getNoteDetail(route.params.id)
    if (res.code === 0) {
      note.value = res.data
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

function onBack() {
  router.back()
}

async function toggleFavorite() {
  try {
    if (isFavorited.value) {
      await unfavoriteNote(route.params.id)
      isFavorited.value = false
      showToast('已取消收藏')
    } else {
      await favoriteNote(route.params.id)
      isFavorited.value = true
      showToast('收藏成功')
    }
  } catch (error) {
    showToast('操作失败')
  }
}

onMounted(() => {
  loadNoteDetail()
})
</script>

<style scoped>
.note-detail {
  min-height: 100vh;
}

.loading-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.detail-content {
  padding: 16px;
}

.note-title {
  font-size: 20px;
  font-weight: bold;
  color: #323233;
  margin: 0 0 16px 0;
}

.note-author {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
}

.create-time {
  font-size: 12px;
  color: #969799;
}

.note-scenic {
  margin-bottom: 16px;
}

.note-images {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.note-image {
  margin-bottom: 0;
}

.note-content-text {
  font-size: 15px;
  line-height: 1.8;
  color: #646566;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.note-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #646566;
}
</style>
