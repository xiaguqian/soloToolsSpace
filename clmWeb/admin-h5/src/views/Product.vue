<template>
  <div class="page-container">
    <van-nav-bar title="商品管理" />
    <van-search v-model="keyword" placeholder="搜索商品" @search="loadProducts" />
    <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="loadProducts">
      <van-card v-for="product in productList" :key="product.id" :title="product.name" :desc="product.category_name">
        <template #tags>
          <van-tag :type="product.status === 1 ? 'success' : 'danger'">
            {{ product.status === 1 ? '上架' : '下架' }}
          </van-tag>
        </template>
        <template #footer>
          <span class="product-price">¥{{ product.price.toFixed(2) }}</span>
          <span class="product-stock">{{ product.stock === -1 ? '库存充足' : `库存: ${product.stock}` }}</span>
        </template>
        <van-button :type="product.status === 1 ? 'danger' : 'success'" size="small" @click="handleToggle(product)">
          {{ product.status === 1 ? '下架' : '上架' }}
        </van-button>
      </van-card>
    </van-list>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { product as productApi } from '../utils/api'

const keyword = ref('')
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const productList = ref([])

const loadProducts = async () => {
  if (loading.value) return
  loading.value = true
  
  try {
    const res = await productApi.list({
      page: page.value,
      pageSize: 10,
      keyword: keyword.value || undefined
    })
    if (res.code === 200) {
      if (res.data.list.length === 0) {
        finished.value = true
      } else {
        productList.value = [...productList.value, ...res.data.list]
        page.value++
      }
    }
  } catch (error) {
    showToast('获取商品失败')
  }
  
  loading.value = false
}

const handleToggle = async (product) => {
  try {
    const res = await productApi.update(product.id, { status: product.status === 1 ? 0 : 1 })
    if (res.code === 200) {
      showToast(product.status === 1 ? '已下架' : '已上架')
      product.status = product.status === 1 ? 0 : 1
    }
  } catch (error) {
    showToast('操作失败')
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}

.product-stock {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}
</style>
