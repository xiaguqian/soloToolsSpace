<template>
  <div class="order-page">
    <div class="page-header">
      <div class="search-bar">
        <el-select v-model="type" placeholder="订单类型" class="type-select">
          <el-option label="全部" :value="''" />
          <el-option label="堂食" :value="1" />
          <el-option label="外卖" :value="2" />
        </el-select>
        <el-select v-model="order_status" placeholder="订单状态" class="status-select">
          <el-option label="全部" :value="''" />
          <el-option label="待接单" :value="0" />
          <el-option label="制作中" :value="1" />
          <el-option label="已完成" :value="2" />
          <el-option label="已取消" :value="3" />
          <el-option label="配送中" :value="4" />
        </el-select>
        <el-button type="primary" @click="loadOrders">搜索</el-button>
      </div>
    </div>
    <el-table :data="orderList" border class="order-table">
      <el-table-column prop="order_no" label="订单号" />
      <el-table-column prop="type" label="类型">
        <template #default="scope">
          <el-tag :type="scope.row.type === 1 ? 'success' : 'info'">
            {{ scope.row.type === 1 ? '堂食' : '外卖' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="table_name" label="桌号/地址">
        <template #default="scope">
          <span>{{ scope.row.table_name || '外卖订单' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="total_amount" label="金额" formatter="formatPrice" />
      <el-table-column prop="order_status" label="状态">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.order_status)">
            {{ getStatusText(scope.row.order_status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="pay_status" label="支付状态">
        <template #default="scope">
          <el-tag :type="scope.row.pay_status === 1 ? 'success' : 'warning'">
            {{ scope.row.pay_status === 1 ? '已支付' : '未支付' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="下单时间" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="text" @click="viewOrder(scope.row)">详情</el-button>
          <el-button type="text" v-if="scope.row.order_status === 0" @click="handleAccept(scope.row)">接单</el-button>
          <el-button type="text" v-if="scope.row.order_status === 1" @click="handleProgress(scope.row)">确认制作</el-button>
          <el-button type="text" v-if="scope.row.type === 2 && scope.row.order_status === 1" @click="handleDeliver(scope.row)">配送</el-button>
          <el-button type="text" v-if="scope.row.order_status === 1 || scope.row.order_status === 4" @click="handleComplete(scope.row)">完成</el-button>
          <el-button type="text" v-if="scope.row.order_status !== 2" @click="handleCancel(scope.row)">取消</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination 
      :current-page="page" 
      :page-size="pageSize" 
      :total="total" 
      @current-change="handlePageChange"
      layout="prev, pager, next, jumper, ->, total"
    />
    
    <el-dialog title="订单详情" :visible.sync="showDetailModal" width="600px">
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-header">
          <div class="order-info">
            <span class="order-no">订单号：{{ currentOrder.order_no }}</span>
            <span class="order-type">{{ currentOrder.type === 1 ? '堂食' : '外卖' }}</span>
          </div>
          <div class="order-status">
            <el-tag :type="getStatusType(currentOrder.order_status)">
              {{ getStatusText(currentOrder.order_status) }}
            </el-tag>
          </div>
        </div>
        <div class="detail-body">
          <div class="section">
            <h4>商品明细</h4>
            <el-table :data="currentOrder.items" border class="items-table">
              <el-table-column prop="product_name" label="商品名称" />
              <el-table-column prop="price" label="单价" />
              <el-table-column prop="quantity" label="数量" />
            </el-table>
          </div>
          <div class="section">
            <h4>订单信息</h4>
            <div class="info-list">
              <div class="info-item">
                <span class="label">金额：</span>
                <span class="value">¥{{ currentOrder.total_amount.toFixed(2) }}</span>
              </div>
              <div class="info-item">
                <span class="label">桌号：</span>
                <span class="value">{{ currentOrder.table_name || '-' }}</span>
              </div>
              <div class="info-item" v-if="currentOrder.address">
                <span class="label">收货地址：</span>
                <span class="value">{{ currentOrder.address.receiver }} {{ currentOrder.address.phone }} {{ currentOrder.address.address_detail }}</span>
              </div>
              <div class="info-item" v-if="currentOrder.remark">
                <span class="label">备注：</span>
                <span class="value">{{ currentOrder.remark }}</span>
              </div>
              <div class="info-item">
                <span class="label">下单时间：</span>
                <span class="value">{{ currentOrder.created_at }}</span>
              </div>
            </div>
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { order as orderApi } from '../utils/api'

const type = ref('')
const order_status = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const orderList = ref([])
const showDetailModal = ref(false)
const currentOrder = ref(null)

const statusMap = {
  0: { text: '待接单', type: 'warning' },
  1: { text: '制作中', type: 'primary' },
  2: { text: '已完成', type: 'success' },
  3: { text: '已取消', type: 'danger' },
  4: { text: '配送中', type: 'info' }
}

const getStatusText = (status) => {
  return statusMap[status]?.text || '未知'
}

const getStatusType = (status) => {
  return statusMap[status]?.type || 'info'
}

const loadOrders = async () => {
  try {
    const params = {
      page: page.value,
      pageSize: page.value,
      type: type.value !== '' ? type.value : undefined,
      order_status: order_status.value !== '' ? order_status.value : undefined
    }
    const res = await orderApi.list(params)
    if (res.code === 200) {
      orderList.value = res.data.list
      total.value = res.data.total
      page.value = res.data.page
    }
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  }
}

const handlePageChange = (val) => {
  page.value = val
  loadOrders()
}

const viewOrder = async (row) => {
  try {
    const res = await orderApi.get(row.id)
    if (res.code === 200) {
      currentOrder.value = res.data
      showDetailModal.value = true
    }
  } catch (error) {
    ElMessage.error('获取订单详情失败')
  }
}

const handleAccept = async (row) => {
  try {
    const res = await orderApi.accept(row.id)
    if (res.code === 200) {
      ElMessage.success('接单成功')
      loadOrders()
    }
  } catch (error) {
    ElMessage.error('接单失败')
  }
}

const handleProgress = async (row) => {
  try {
    const res = await orderApi.progress(row.id)
    if (res.code === 200) {
      ElMessage.success('确认制作成功')
      loadOrders()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDeliver = async (row) => {
  try {
    const res = await orderApi.deliver(row.id)
    if (res.code === 200) {
      ElMessage.success('已标记为配送中')
      loadOrders()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleComplete = async (row) => {
  try {
    const res = await orderApi.complete(row.id)
    if (res.code === 200) {
      ElMessage.success('订单已完成')
      loadOrders()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleCancel = async (row) => {
  if (!confirm('确定要取消该订单吗？')) return
  
  try {
    const res = await orderApi.cancel(row.id)
    if (res.code === 200) {
      ElMessage.success('订单已取消')
      loadOrders()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-page {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.page-header {
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
}

.type-select, .status-select {
  width: 150px;
}

.order-table {
  margin-bottom: 20px;
}

.order-detail {
  padding: 10px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.order-info {
  display: flex;
  gap: 10px;
}

.order-no {
  font-size: 16px;
  font-weight: bold;
}

.order-type {
  padding: 4px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
}

.section {
  margin-bottom: 20px;
}

.section h4 {
  margin-bottom: 10px;
  color: #666;
}

.items-table {
  width: 100%;
}

.info-list {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #909399;
  width: 80px;
}

.value {
  color: #303133;
}
</style>
