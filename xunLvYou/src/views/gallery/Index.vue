<template>
  <div class="gallery-page">
    <van-nav-bar title="个人图集" left-arrow @click-left="onBack">
      <template #right>
        <van-icon name="plus" @click="showUpload = true" />
      </template>
    </van-nav-bar>

    <van-tabs v-model:active="activeTab">
      <van-tab title="全部">
        <gallery-grid :list="galleryList" @click="previewImage" @delete="deleteImage" />
      </van-tab>
      <van-tab title="穿搭">
        <gallery-grid :list="outfitList" @click="previewImage" @delete="deleteImage" />
      </van-tab>
      <van-tab title="智能出行">
        <gallery-grid :list="smartTravelList" @click="previewImage" @delete="deleteImage" />
      </van-tab>
      <van-tab title="手动上传">
        <gallery-grid :list="manualList" @click="previewImage" @delete="deleteImage" />
      </van-tab>
    </van-tabs>

    <van-popup
      v-model:show="showUpload"
      round
      position="bottom"
      :style="{ height: 'auto' }"
    >
      <div class="upload-popup">
        <div class="popup-title">上传图片</div>
        <van-uploader
          v-model="uploadImages"
          :max-count="9"
          multiple
        />
        <div class="popup-actions">
          <van-button type="default" round @click="showUpload = false">取消</van-button>
          <van-button type="primary" round :loading="uploading" @click="handleUpload">上传</van-button>
        </div>
      </div>
    </van-popup>

    <van-image-preview
      v-model:show="showPreview"
      :images="previewImages"
      :start-position="previewIndex"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getGalleryList, addToGallery, deleteFromGallery } from '@/api/gallery'
import { showToast, showConfirmDialog } from 'vant'
import GalleryGrid from '@/components/GalleryGrid.vue'

const router = useRouter()
const activeTab = ref(0)
const showUpload = ref(false)
const showPreview = ref(false)
const previewIndex = ref(0)
const uploading = ref(false)
const galleryList = ref([])
const uploadImages = ref([])

const outfitList = computed(() => galleryList.value.filter(item => item.type === 'outfit'))
const smartTravelList = computed(() => galleryList.value.filter(item => item.type === 'smart-travel'))
const manualList = computed(() => galleryList.value.filter(item => item.type === 'manual'))
const previewImages = computed(() => galleryList.value.map(item => item.url))

async function loadGalleryList() {
  try {
    const res = await getGalleryList()
    if (res.code === 0) {
      galleryList.value = res.data.list || []
    }
  } catch (error) {
    showToast('加载失败')
  }
}

function previewImage(item, index) {
  previewIndex.value = galleryList.value.findIndex(g => g.id === item.id)
  showPreview.value = true
}

async function deleteImage(item) {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定删除该图片？'
    })
    await deleteFromGallery(item.id)
    showToast('删除成功')
    loadGalleryList()
  } catch (error) {}
}

async function handleUpload() {
  if (uploadImages.value.length === 0) {
    showToast('请选择图片')
    return
  }
  
  try {
    uploading.value = true
    for (const img of uploadImages.value) {
      await addToGallery({ url: img.url || img, type: 'manual' })
    }
    showToast('上传成功')
    showUpload.value = false
    uploadImages.value = []
    loadGalleryList()
  } catch (error) {
    showToast('上传失败')
  } finally {
    uploading.value = false
  }
}

function onBack() {
  router.back()
}

onMounted(() => {
  loadGalleryList()
})
</script>

<style scoped>
.gallery-page {
  min-height: 100vh;
}

.upload-popup {
  padding: 20px;
}

.popup-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  text-align: center;
}

.popup-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.popup-actions .van-button {
  flex: 1;
}
</style>
