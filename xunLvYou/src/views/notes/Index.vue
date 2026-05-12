<template>
  <div class="notes-page">
    <van-nav-bar title="出行笔记" :arrow="false">
      <template #right>
        <van-icon name="plus" @click="goCreate" />
      </template>
    </van-nav-bar>

    <van-loading v-if="loading" class="loading-center" />

    <van-list
      v-else
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="loadNotes"
    >
      <div v-if="notes.length === 0" class="empty-state">
        暂无出行笔记，快来发布吧
      </div>
      <div v-else class="notes-list">
        <van-cell-group>
          <van-cell
            v-for="note in notes"
            :key="note.id"
            @click="goDetail(note.id)"
          >
            <template #title>
              <div class="note-item">
                <div class="note-cover">
                  <van-image
                    :src="note.coverImage"
                    width="80"
                    height="80"
                    fit="cover"
                    radius="8"
                  />
                </div>
                <div class="note-content">
                  <div class="note-title">{{ note.title }}</div>
                  <div class="note-meta">
                    <span class="author">{{ note.author }}</span>
                    <span class="time">{{ note.createTime }}</span>
                  </div>
                  <div class="note-scenic">
                    <van-icon name="location-o" />
                    <span>{{ note.scenicName }}</span>
                  </div>
                </div>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </van-list>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNoteList } from '@/api/note'
import { showToast } from 'vant'

const router = useRouter()
const loading = ref(false)
const finished = ref(false)
const notes = ref([])

async function loadNotes() {
  try {
    const res = await getNoteList()
    if (res.code === 0) {
      notes.value = res.data.list || []
      finished.value = true
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

function goCreate() {
  router.push('/note-create')
}

function goDetail(id) {
  router.push(`/notes/${id}`)
}

onMounted(() => {
  loadNotes()
})
</script>

<style scoped>
.notes-page {
  min-height: 100vh;
}

.loading-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.note-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
}

.note-cover {
  flex-shrink: 0;
}

.note-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.note-title {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 4px;
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
  margin-bottom: 4px;
}

.note-scenic {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #646566;
}
</style>
