<template>
  <div class="note-create">
    <van-nav-bar
      title="发布笔记"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.title"
          name="title"
          label="标题"
          placeholder="请输入笔记标题"
          :rules="[{ required: true, message: '请输入笔记标题' }]"
        />

        <van-field
          v-model="form.scenicId"
          name="scenicId"
          label="选择景点"
          placeholder="请选择景点"
          readonly
          is-link
          @click="showScenicPicker = true"
          :rules="[{ required: true, message: '请选择景点' }]"
        >
          <template #input>
            <span :class="form.scenicName ? '' : 'placeholder'">
              {{ form.scenicName || '请选择景点' }}
            </span>
          </template>
        </van-field>

        <van-field
          v-model="form.content"
          name="content"
          label="内容"
          type="textarea"
          placeholder="分享你的旅行经历..."
          rows="6"
          :rules="[{ required: true, message: '请输入笔记内容' }]"
        />
      </van-cell-group>

      <div class="upload-section">
        <div class="section-title">上传图片</div>
        <van-uploader
          v-model="form.images"
          :max-count="9"
          multiple
        />
      </div>

      <div class="submit-btn">
        <van-button round block type="primary" native-type="submit" :loading="submitting">
          发布
        </van-button>
      </div>
    </van-form>

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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createNote } from '@/api/note'
import { getScenicList } from '@/api/scenic'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const submitting = ref(false)
const showScenicPicker = ref(false)
const scenicList = ref([])

const form = reactive({
  title: '',
  scenicId: '',
  scenicName: '',
  content: '',
  images: []
})

const scenicColumns = ref([])

async function loadScenicList() {
  try {
    const res = await getScenicList()
    if (res.code === 0) {
      scenicList.value = res.data.list || []
      scenicColumns.value = scenicList.value.map(item => ({
        text: item.name,
        value: item.id
      }))
      
      if (route.query.scenicId) {
        const scenic = scenicList.value.find(s => s.id === route.query.scenicId)
        if (scenic) {
          form.scenicId = scenic.id
          form.scenicName = scenic.name
        }
      }
    }
  } catch (error) {
    showToast('加载景点失败')
  }
}

function onScenicConfirm({ selectedOptions }) {
  const option = selectedOptions[0]
  form.scenicId = option.value
  form.scenicName = option.text
  showScenicPicker.value = false
}

async function onSubmit() {
  try {
    submitting.value = true
    const res = await createNote(form)
    if (res.code === 0) {
      showToast('发布成功')
      router.back()
    }
  } catch (error) {
    showToast('发布失败')
  } finally {
    submitting.value = false
  }
}

function onBack() {
  router.back()
}

onMounted(() => {
  loadScenicList()
})
</script>

<style scoped>
.note-create {
  min-height: 100vh;
  padding-bottom: 80px;
}

.upload-section {
  padding: 16px;
  background: #fff;
  margin: 12px 16px;
  border-radius: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 12px;
}

.submit-btn {
  padding: 16px;
}

.placeholder {
  color: #c8c9cc;
}
</style>
