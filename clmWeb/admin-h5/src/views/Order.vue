<template>
  <div class="page-container">
    <van-nav-bar title="订单管理" />
    <van-tabs v-model="activeTab" sticky>
      <van-tab title="全部">
        <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="loadOrders">
          <van-card v-for="order in orderList" :key="order.id" :title="order.order_no" :desc="getOrderType(order.type)" @click="viewOrder(order)">
            <template #tags>
              <van-tag :type="getStatusType(order.order_status)">{{ getStatusText(order.order_status) }}</van-tag>
            </template>
            <template #footer>
              <span class="order-amount">¥{{ order.total_amount.toFixed(2) }}</span>
              <span class="order-time">{{ formatTime(order.created_at) }}</span>
            </template>
            <van-button type="primary" size="small" @click.stop="handleAction(order)" v-if="order.order_status === 0">接单</van-button>
            <van-button type="warning" size="small" @click.stop="handleAction(order)" v-else-if="order.order_status === 1">
              {{ order.type === 2 ? '配送' : '完成' }}
            </van-button>
            <van-button type="success" size="small" @click.stop="handleAction(order)" v-else-if="order.order_status === 4">完成</van-button>
            <van-button type="default" size="small" @click.stop="handleCancel(order)" v-else-if="order.order_status !== 2">取消</van-button>
          </van-card>
        </van-list>
      </van-tab>
      <van-tab title="待接单">
        <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="loadOrders({ order_status: 0 })">
          <van-card v-for="order in pendingOrders" :key="order.id" :title="order.order_no" :desc="getOrderType(order.type)">
            <template #tags>
              <van-tag type="warning">{{ getStatusText(order.order_status) }}</van-tag>
            </template>
            <template #footer>
              <span class="order-amount">¥{{ order.total_amount.toFixed(2) }}</span>
            </template>
            <van-button type="primary" size="small" @click.stop="handleAccept(order)">接单</van-button>
          </van-card>
        </van-list>
      </van-tab>
      <van-tab title="制作中">
        <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="loadOrders({ order_status: 1 })">
          <van-card v-for="order in processingOrders" :key="order.id" :title="order.order_no" :desc="getOrderType(order.type)">
            <template #tags>
              <van-tag type="primary">{{ getStatusText(order.order_status) }}</van-tag>
            </template>
            <template #footer>
              <span class="order-amount">¥{{ order.total_amount.toFixed(2) }}</span>
            </template>
            <van-button type="warning" size="small" @click.stop="handleProgress(order)">
              {{ order.type === 2 ? '配送' : '完成' }}
            </van-button>
          </van-card>
        </van-list>
      </van-tab>
    </van-tabs>
    
    <van-dialog v-model="showDetail" title="订单详情">
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-row">
          <span class="label">订单号</span>
          <span class="value">{{ currentOrder.order_no }}</span>
        </div>
        <div class="detail-row">
          <span class="label">类型</span>
          <span class="value">{{ getOrderType(currentOrder.type) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">桌号</span>
          <span class="value">{{ currentOrder.table_name || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">金额</span>
          <span class="value">¥{{ currentOrder.total_amount.toFixed(2) }}</span>
        </div>
        <div class="section">
          <h4>商品明细</h4>
          <div v-for="item in currentOrder.items" :key="item.id" class="item-row">
            <span>{{ item.product_name }}</span>
            <span>x{{ item.quantity }}</span>
          </div>
        </div>
        <div v-if="currentOrder.remark" class="detail-row">
          <span class="label">备注</span>
          <span class="value">{{ currentOrder.remark }}</span>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast, showDialog } from 'vant'
import { order as orderApi } from '../utils/api'

const activeTab = ref(0)
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const orderList = ref([])
const showDetail = ref(false)
const currentOrder = ref(null)

const statusMap = {
  0: { text: '待接单', type: 'warning' },
  1: { text: '制作中', type: 'primary' },
  2: { text: '已完成', type: 'success' },
  3: { text: '已取消', type: 'danger' },
  4: { text: '配送中', type: 'info' }
}

const getStatusText = (status) => statusMap[status]?.text || '未知'
const getStatusType = (status) => statusMap[status]?.type || 'default'
const getOrderType = (type) => type === 1 ? '堂食' : '外卖'

const formatTime = (time) => {
  if (!time) return ''
  const t = new Date(time)
  return `${t.getHours()}:${String(t.getMinutes()).padStart(2, '0')}`
}

const pendingOrders = computed(() => orderList.value.filter(o => o.order_status === 0))
const processingOrders = computed(() => orderList.value.filter(o => o.order_status === 1 || o.order_status === 4))

const loadOrders = async (params = {}) => {
  if (loading.value) return
  loading.value = true
  
  try {
    const res = await orderApi.list({
      page: page.value,
      pageSize: 10,
      ...params
    })
    if (res.code === 200) {
      if (res.data.list.length === 0) {
        finished.value = true
      } else {
        orderList.value = [...orderList.value, ...res.data.list]
        page.value++
      }
    }
  } catch (error) {
    showToast('获取订单失败')
  }
  
  loading.value = false
}

const viewOrder = async (order) => {
  try {
    const res = await orderApi.get(order.id)
    if (res.code === 200) {
      currentOrder.value = res.data
      showDetail.value = true
    }
  } catch (error) {
    showToast('获取详情失败')
  }
}

const handleAccept = async (order) => {
  try {
    const res = await orderApi.accept(order.id)
    if (res.code === 200) {
      showToast('接单成功')
      loadOrders()
    }
  } catch (error) {
    showToast('接单失败')
  }
}

const handleProgress = async (order) => {
  if (order.type === 2) {
    try {
      const res = await orderApi.deliver(order.id)
      if (res.code === 200) {
        showToast('已标记配送')
        loadOrders()
      }
    } catch (error) {
      showToast('操作失败')
    }
  } else {
    try {
      const res = await orderApi.complete(order.id)
      if (res.code === 200) {
        showToast('订单完成')
        loadOrders()
      }
    } catch (error) {
      showToast('操作失败')
    }
  }
}

const handleAction = async (order) => {
  if (order.order_status === 0) {
    handleAccept(order)
  } else if (order.order_status === 1) {
    handleProgress(order)
  } else if (order.order_status === 4) {
    try {
      const res = await orderApi.complete(order.id)
      if (res.code === 200) {
        showToast('订单完成')
        loadOrders()
      }
    } catch (error) {
      showToast('操作失败')
    }
  }
}

const handleCancel = async (order) => {
  showDialog({
    message: '确定要取消该订单吗？'
  }).then(async () => {
    try {
      const res = await orderApi.cancel(order.id)
      if (res.code === 200) {
        showToast('订单已取消')
        loadOrders()
      }
    } catch (error) {
      showToast('操作失败')
    }
  })
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-amount {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}

.order-time {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.order-detail {
  padding: 10px 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  color: #999;
  font-size: 14px;
}

.value {
  color: #333;
  font-size: 14px;
}

.section {
  margin-top: 15px;
}

.section h4 {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}
</style>
