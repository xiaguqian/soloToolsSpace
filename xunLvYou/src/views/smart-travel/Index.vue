<template>
  <div class="smart-travel">
    <van-nav-bar
      title="智能云出行"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <div class="page-content">
      <div class="section-title">选择景点</div>
      <van-cell-group inset>
        <van-field
          v-model="selectedScenicName"
          name="scenic"
          label="景点"
          placeholder="请选择景点"
          readonly
          is-link
          @click="showScenicPicker = true"
          :rules="[{ required: true, message: '请选择景点' }]"
        >
          <template #input>
            <span :class="selectedScenicName ? '' : 'placeholder'">
              {{ selectedScenicName || '请选择景点' }}
            </span>
          </template>
        </van-field>
      </van-cell-group>

      <div class="section-title">选择景点图片</div>
      <div class="image-section">
        <van-uploader
          v-model="scenicImages"
          :max-count="5"
          multiple
        />
      </div>

      <div class="section-title">上传穿搭图片</div>
      <div class="image-section">
        <van-uploader
          v-model="outfitImages"
          :max-count="5"
          multiple
        />
      </div>

      <div class="section-title">或从个人图集中选择</div>
      <van-cell-group inset>
        <van-cell
          title="个人图集"
          is-link
          @click="showGalleryPicker = true"
        >
          <template #right-icon>
            <span v-if="selectedGalleryImages.length > 0" class="selected-count">
              已选{{ selectedGalleryImages.length }}张
            </span>
          </template>
        </van-cell>
      </van-cell-group>

      <div class="action-section">
        <van-button
          type="primary"
          round
          block
          :loading="generating"
          :disabled="!canGenerate"
          @click="generate"
        >
          生成AI出行图片集
        </van-button>
      </div>

      <div v-if="resultImages.length > 0" class="result-section">
        <div class="section-title">生成结果</div>
        <div class="result-grid">
          <van-image
            v-for="(img, index) in resultImages"
            :key="index"
            :src="img"
            width="100%"
            fit="cover"
            radius="12"
            @click="previewImage(index)"
          />
        </div>
        <div class="action-buttons">
          <van-button type="default" round @click="saveToGallery">
            保存到图集
          </van-button>
        </div>
      </div>
    </div>

    <van-popup
      v-model:show="showScenicPicker"
      round
      position="bottom"
      :style="{ height: '60%' }"
    >
      <van-picker
        :columns="scenicColumns"
        show-toolbar
        title="选择景点"
        @confirm="onScenicConfirm"
        @cancel="showScenicPicker = false"
      />
    </van-popup>

    <van-popup
      v-model:show="showGalleryPicker"
      round
      position="bottom"
      :style="{ height: '70%' }"
    >
      <div class="gallery-picker">
        <div class="picker-header">
          <span class="picker-title">选择图片</span>
          <van-button type="primary" size="small" @click="confirmGallery">确定</van-button>
        </div>
        <div class="gallery-grid">
          <div
            v-for="(img, index) in galleryImages"
            :key="index"
            class="gallery-item"
            @click="toggleGalleryImage(img)"
          >
            <van-image :src="img.url" width="100%" height="120" fit="cover" />
            <div v-if="isGalleryImageSelected(img)" class="selected-mark">
              <van-icon name="checked" />
            </div>
          </div>
        </div>
      </div>
    </van-popup>

    <van-image-preview
      v-model:show="showPreview"
      :images="resultImages"
      :start-position="previewIndex"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { generateSmartTravel } from '@/api/smartTravel'
import { getScenicList } from '@/api/scenic'
import { getGalleryList, addToGallery } from '@/api/gallery'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const generating = ref(false)
const showScenicPicker = ref(false)
const showGalleryPicker = ref(false)
const showPreview = ref(false)
const previewIndex = ref(0)
const scenicList = ref([])
const galleryImages = ref([])
const selectedScenic = ref(null)
const scenicImages = ref([])
const outfitImages = ref([])
const selectedGalleryImages = ref([])
const resultImages = ref([])

const selectedScenicName = computed(() => selectedScenic.value?.name || '')
const scenicColumns = computed(() => 
  scenicList.value.map(item => ({ text: item.name, value: item.id }))
)
const canGenerate = computed(() => 
  selectedScenic.value && (scenicImages.value.length > 0 || outfitImages.value.length > 0 || selectedGalleryImages.value.length > 0)
)

async function loadScenicList() {
  try {
    const res = await getScenicList()
    if (res.code === 0) {
      scenicList.value = res.data.list || []
      
      if (route.query.planId) {
        const scenic = scenicList.value[0]
        if (scenic) {
          selectedScenic.value = scenic
        }
      }
    }
  } catch (error) {
    showToast('加载景点失败')
  }
}

async function loadGalleryImages() {
  try {
    const res = await getGalleryList()
    if (res.code === 0) {
      galleryImages.value = res.data.list || []
    }
  } catch (error) {}
}

function onScenicConfirm({ selectedOptions }) {
  const option = selectedOptions[0]
  selectedScenic.value = scenicList.value.find(s => s.id === option.value)
  showScenicPicker.value = false
}

function isGalleryImageSelected(img) {
  return selectedGalleryImages.value.some(i => i.id === img.id)
}

function toggleGalleryImage(img) {
  const index = selectedGalleryImages.value.findIndex(i => i.id === img.id)
  if (index > -1) {
    selectedGalleryImages.value.splice(index, 1)
  } else {
    selectedGalleryImages.value.push(img)
  }
}

function confirmGallery() {
  showGalleryPicker.value = false
}

async function generate() {
  if (!selectedScenic.value) {
    showToast('请选择景点')
    return
  }
  
  try {
    generating.value = true
    const res = await generateSmartTravel({
      scenicId: selectedScenic.value.id,
      scenicImages: scenicImages.value,
      outfitImages: outfitImages.value,
      galleryImages: selectedGalleryImages.value
    })
    if (res.code === 0) {
      resultImages.value = res.data.images || []
      showToast('生成成功')
    }
  } catch (error) {
    showToast('生成失败')
  } finally {
    generating.value = false
  }
}

function previewImage(index) {
  previewIndex.value = index
  showPreview.value = true
}

async function saveToGallery() {
  try {
    for (const img of resultImages.value) {
      await addToGallery({ url: img, type: 'smart-travel' })
    }
    showToast('保存成功')
  } catch (error) {
    showToast('保存失败')
  }
}

function onBack() {
  router.back()
}

onMounted(() => {
  loadScenicList()
  loadGalleryImages()
})
</script>

<style scoped>
.smart-travel {
  min-height: 100vh;
  padding-bottom: 80px;
}

.page-content {
  padding: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin: 20px 0 12px;
}

.image-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.action-section {
  margin-top: 24px;
}

.result-section {
  margin-top: 24px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-buttons {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.placeholder {
  color: #c8c9cc;
}

.selected-count {
  font-size: 13px;
  color: #1989fa;
  margin-right: 8px;
}

.gallery-picker {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.picker-title {
  font-size: 16px;
  font-weight: 500;
}

.gallery-grid {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.gallery-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.selected-mark {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: #1989fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
</style>
