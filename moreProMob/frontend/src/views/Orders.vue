<template>
  <div class="orders">
    <div class="toolbar">
      <div class="search-box">
        <el-input v-model="searchForm.order_no" placeholder="搜索订单号" class="search-input" />
        <el-select v-model="searchForm.status" placeholder="选择状态">
          <el-option label="全部" value="" />
          <el-option label="待支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已发货" :value="2" />
          <el-option label="已完成" :value="3" />
          <el-option label="已取消" :value="4" />
        </el-select>
        <el-button type="primary" @click="loadOrders">搜索</el-button>
      </div>
      <el-button type="success" @click="exportOrders">导出订单</el-button>
    </div>
    
    <el-table :data="orders" border>
      <el-table-column prop="order_no" label="订单号" />
      <el-table-column prop="nickname" label="用户" />
      <el-table-column prop="total_amount" label="金额" width="100">
        <template #default="scope">¥{{ scope.row.total_amount }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="text" @click="viewOrder(scope.row)">详情</el-button>
          <el-button v-if="scope.row.status === 1" type="text" @click="shipOrder(scope.row)">发货</el-button>
          <el-button v-if="scope.row.status === 2" type="text" @click="finishOrder(scope.row)">完成</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination 
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.page"
      :page-sizes="[10, 20, 50]"
      :page-size="pagination.limit"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
    />
    
    <el-dialog title="订单详情" :visible.sync="showDetailModal">
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-header">
          <div class="order-info">
            <span class="order-no">订单号: {{ currentOrder.order_no }}</span>
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </div>
          <div class="user-info">
            <span>用户: {{ currentOrder.nickname }}</span>
            <span>手机: {{ currentOrder.phone }}</span>
          </div>
        </div>
        <div class="detail-body">
          <h4>订单商品</h4>
          <el-table :data="currentOrder.items_json" border>
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="price" label="单价" />
            <el-table-column prop="quantity" label="数量" />
          </el-table>
          <div class="total-row">
            <span>订单总额: ¥{{ currentOrder.total_amount }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { orderApi } from '../api'

const orders = ref([])
const showDetailModal = ref(false)
const currentOrder = ref(null)
const searchForm = reactive({
  order_no: '',
  status: ''
})
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const statusMap = {
  0: { text: '待支付', type: 'warning' },
  1: { text: '已支付', type: 'primary' },
  2: { text: '已发货', type: 'success' },
  3: { text: '已完成', type: 'success' },
  4: { text: '已取消', type: 'danger' }
}

const getStatusText = (status) => {
  return statusMap[status]?.text || '未知'
}

const getStatusType = (status) => {
  return statusMap[status]?.type || 'info'
}

const loadOrders = async () => {
  try {
    const res = await orderApi.list({
      page: pagination.page,
      limit: pagination.limit,
      order_no: searchForm.order_no,
      status: searchForm.status || undefined
    })
    if (res.code === 200) {
      orders.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    ElMessage.error('加载失败')
  }
}

const viewOrder = async (row) => {
  try {
    const res = await orderApi.get(row.id)
    if (res.code === 200) {
      currentOrder.value = res.data
      showDetailModal.value = true
    }
  } catch (error) {
    ElMessage.error('加载失败')
  }
}

const shipOrder = async (row) => {
  try {
    const res = await orderApi.update(row.id, { status: 2 })
    if (res.code === 200) {
      row.status = 2
      ElMessage.success('发货成功')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const finishOrder = async (row) => {
  try {
    const res = await orderApi.update(row.id, { status: 3 })
    if (res.code === 200) {
      row.status = 3
      ElMessage.success('订单完成')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const exportOrders = async () => {
  try {
    const res = await orderApi.export({})
    const blob = new Blob([res], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const handleSizeChange = (val) => {
  pagination.limit = val
  loadOrders()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  loadOrders()
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  width: 200px;
}

.order-detail {
  padding: 10px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.order-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.order-no {
  font-weight: bold;
}

.user-info span {
  margin-left: 10px;
}

.detail-body {
  margin-top: 10px;
}

.total-row {
  text-align: right;
  margin-top: 10px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .search-box {
    flex-wrap: wrap;
  }
  
  .search-input {
    width: 100%;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 10px;
  }
}
</style>