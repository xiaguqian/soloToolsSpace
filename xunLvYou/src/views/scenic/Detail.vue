<template>
  <div class="scenic-detail">
    <van-nav-bar
      title="景点详情"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    >
      <template #right>
        <van-icon :name="isFavorited ? 'star' : 'star-o'" @click="toggleFavorite" />
      </template>
    </van-nav-bar>

    <van-loading v-if="loading" class="loading-center" />

    <div v-else-if="scenic">
      <van-swipe class="swipe" :autoplay="3000">
        <van-swipe-item v-for="img in scenic.images" :key="img">
          <van-image :src="img" fit="cover" width="100%" height="240" />
        </van-swipe-item>
      </van-swipe>

      <div class="detail-content">
        <div class="scenic-header">
          <h2 class="scenic-name">{{ scenic.name }}</h2>
          <div class="scenic-rating">
            <van-rate v-model="scenic.rating" readonly :size="16" />
            <span class="rating-text">{{ scenic.rating }}分</span>
          </div>
        </div>

        <div class="scenic-meta">
          <div class="meta-item">
            <van-icon name="location-o" />
            <span>{{ scenic.address }}</span>
          </div>
          <div class="meta-item">
            <van-icon name="clock-o" />
            <span>{{ scenic.openTime }}</span>
          </div>
          <div class="meta-item">
            <van-icon name="money-o" />
            <span v-if="scenic.isPaid">门票: {{ scenic.price }}元</span>
            <span v-else>免费</span>
          </div>
        </div>

        <van-divider>景点介绍</van-divider>
        <div class="scenic-description">{{ scenic.description }}</div>

        <van-divider>标签</van-divider>
        <div class="tags-container">
          <van-tag v-for="tag in scenic.tags" :key="tag" type="primary" plain>
            {{ tag }}
          </van-tag>
        </div>

        <van-divider>出行笔记</van-divider>
        <div class="notes-section">
          <div v-if="scenic.notes?.length" class="notes-list">
            <div
              v-for="note in scenic.notes"
              :key="note.id"
              class="note-item"
              @click="goNoteDetail(note.id)"
            >
              <van-image
                :src="note.coverImage"
                width="80"
                height="80"
                fit="cover"
                radius="8"
              />
              <div class="note-info">
                <div class="note-title">{{ note.title }}</div>
                <div class="note-meta">
                  <span class="note-author">{{ note.author }}</span>
                  <span class="note-time">{{ note.createTime }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            暂无出行笔记，快来发布第一篇吧
          </div>
        </div>
      </div>

      <van-bottom-bar>
        <van-button type="primary" round block @click="goCreateNote">
          发布出行笔记
        </van-button>
      </van-bottom-bar>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getScenicDetail, favoriteScenic, unfavoriteScenic } from '@/api/scenic'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const scenic = ref(null)
const isFavorited = ref(false)

async function loadScenicDetail() {
  try {
    const res = await getScenicDetail(route.params.id)
    if (res.code === 0) {
      scenic.value = res.data
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
      await unfavoriteScenic(route.params.id)
      isFavorited.value = false
      showToast('已取消收藏')
    } else {
      await favoriteScenic(route.params.id)
      isFavorited.value = true
      showToast('收藏成功')
    }
  } catch (error) {
    showToast('操作失败')
  }
}

function goNoteDetail(id) {
  router.push(`/notes/${id}`)
}

function goCreateNote() {
  router.push({
    path: '/note-create',
    query: { scenicId: route.params.id }
  })
}

onMounted(() => {
  loadScenicDetail()
})
</script>

<style scoped>
.scenic-detail {
  min-height: 100vh;
  padding-bottom: 60px;
}

.loading-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.swipe {
  width: 100%;
}

.detail-content {
  padding: 16px;
}

.scenic-header {
  margin-bottom: 16px;
}

.scenic-name {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #323233;
}

.scenic-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-text {
  font-size: 14px;
  color: #969799;
}

.scenic-meta {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #646566;
  margin-bottom: 12px;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.scenic-description {
  font-size: 14px;
  line-height: 1.8;
  color: #646566;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px;
}

.notes-section {
  background: #fff;
  border-radius: 12px;
  margin-top: 12px;
  padding: 12px;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note-item {
  display: flex;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.note-item:active {
  background: #f7f8fa;
}

.note-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.note-title {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #969799;
}
</style>
