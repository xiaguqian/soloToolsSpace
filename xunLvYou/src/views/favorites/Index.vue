<template>
  <div class="favorites-page">
    <van-nav-bar title="个人收藏" left-arrow @click-left="onBack" />

    <van-tabs v-model:active="activeTab">
      <van-tab title="笔记">
        <div class="favorites-list">
          <van-loading v-if="loading" class="loading-center" />
          <div v-else-if="favorites.notes.length === 0" class="empty-state">
            暂无收藏的笔记
          </div>
          <van-cell-group v-else>
            <van-cell
              v-for="item in favorites.notes"
              :key="item.id"
              :title="item.title"
              :label="item.author"
              is-link
              @click="goNoteDetail(item.id)"
            />
          </van-cell-group>
        </div>
      </van-tab>
      <van-tab title="景点">
        <div class="favorites-list">
          <van-loading v-if="loading" class="loading-center" />
          <div v-else-if="favorites.scenics.length === 0" class="empty-state">
            暂无收藏的景点
          </div>
          <van-cell-group v-else>
            <van-cell
              v-for="item in favorites.scenics"
              :key="item.id"
              :title="item.name"
              :label="item.address"
              is-link
              @click="goScenicDetail(item.id)"
            />
          </van-cell-group>
        </div>
      </van-tab>
      <van-tab title="图片">
        <div class="favorites-list">
          <van-loading v-if="loading" class="loading-center" />
          <div v-else-if="favorites.images.length === 0" class="empty-state">
            暂无收藏的图片
          </div>
          <div v-else class="images-grid">
            <van-image
              v-for="item in favorites.images"
              :key="item.id"
              :src="item.url"
              width="100%"
              height="150"
              fit="cover"
              radius="8"
              @click="previewImage(item)"
            />
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <van-image-preview
      v-model:show="showPreview"
      :images="imageUrls"
      :start-position="previewIndex"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFavoritesList } from '@/api/favorite'
import { showToast } from 'vant'

const router = useRouter()
const activeTab = ref(0)
const loading = ref(true)
const showPreview = ref(false)
const previewIndex = ref(0)
const favorites = ref({
  notes: [],
  scenics: [],
  images: []
})

const imageUrls = computed(() => favorites.value.images.map(item => item.url))

async function loadFavorites() {
  try {
    loading.value = true
    const res = await getFavoritesList()
    if (res.code === 0) {
      favorites.value = res.data || { notes: [], scenics: [], images: [] }
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

function goNoteDetail(id) {
  router.push(`/notes/${id}`)
}

function goScenicDetail(id) {
  router.push(`/scenic/${id}`)
}

function previewImage(item) {
  previewIndex.value = favorites.value.images.findIndex(i => i.id === item.id)
  showPreview.value = true
}

function onBack() {
  router.back()
}

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
}

.favorites-list {
  padding: 12px;
}

.loading-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
</style>
