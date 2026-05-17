<template>
  <div class="page-container">
    <van-nav-bar title="桌码管理" />
    <van-search v-model="keyword" placeholder="搜索桌号" @search="loadTables" />
    <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="loadTables">
      <van-card v-for="table in tableList" :key="table.id" :title="table.table_name">
        <template #tags>
          <van-tag :type="table.status === 1 ? 'success' : 'danger'">
            {{ table.status === 1 ? '启用' : '禁用' }}
          </van-tag>
          <van-tag type="info" v-if="table.qrcode_url">已生成二维码</van-tag>
        </template>
        <template #footer>
          <span class="table-qrcode">
            <van-icon name="qr" size="24" @click="previewQrcode(table)" v-if="table.qrcode_url" />
            <span v-else>未生成</span>
          </span>
        </template>
      </van-card>
    </van-list>
    
    <van-dialog v-model="showQrcode" title="二维码">
      <div v-if="previewData" class="qrcode-preview">
        <img :src="previewData.qrcode_url" alt="二维码" />
        <p>{{ previewData.table_name }}</p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { table as tableApi } from '../utils/api'

const keyword = ref('')
const loading = ref(false)
const finished = ref(false)
const tableList = ref([])
const showQrcode = ref(false)
const previewData = ref(null)

const loadTables = async () => {
  if (loading.value) return
  loading.value = true
  
  try {
    const res = await tableApi.list()
    if (res.code === 200) {
      let data = res.data
      if (keyword.value) {
        data = data.filter(item => item.table_name.includes(keyword.value))
      }
      tableList.value = data
      finished.value = true
    }
  } catch (error) {
    showToast('获取桌号失败')
  }
  
  loading.value = false
}

const previewQrcode = (table) => {
  previewData.value = table
  showQrcode.value = true
}

onMounted(() => {
  loadTables()
})
</script>

<style scoped>
.table-qrcode {
  color: #409eff;
}

.qrcode-preview {
  text-align: center;
  padding: 20px;
}

.qrcode-preview img {
  width: 200px;
  height: 200px;
}

.qrcode-preview p {
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
}
</style>
