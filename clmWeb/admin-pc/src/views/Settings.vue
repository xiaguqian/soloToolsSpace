<template>
  <div class="settings-page">
    <el-tabs v-model="activeTab" type="card" class="settings-tabs">
      <el-tab-pane label="基本信息" name="basic">
        <el-form :model="tenantInfo" label-width="120px" class="settings-form">
          <el-form-item label="店铺名称">
            <el-input v-model="tenantInfo.name" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="tenantInfo.tel" />
          </el-form-item>
          <el-form-item label="营业时间">
            <el-input v-model="tenantInfo.business_hours" placeholder="如：10:00-22:00" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveBasic">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="外卖配置" name="takeout">
        <el-form :model="takeoutConfig" label-width="120px" class="settings-form">
          <el-form-item label="开启外卖">
            <el-switch v-model="takeoutConfig.enable_takeout" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="起送价">
            <el-input v-model="takeoutConfig.min_delivery_amount" type="number" />
          </el-form-item>
          <el-form-item label="配送费">
            <el-input v-model="takeoutConfig.delivery_fee" type="number" />
          </el-form-item>
          <el-form-item label="配送范围">
            <el-input v-model="takeoutConfig.delivery_range" type="textarea" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveTakeout">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="支付配置" name="payment">
        <el-form :model="paymentConfig" label-width="120px" class="settings-form">
          <el-form-item label="微信支付参数">
            <el-input v-model="paymentConfig.wx_pay_params" type="textarea" placeholder="JSON格式" />
          </el-form-item>
          <el-form-item label="支付宝参数">
            <el-input v-model="paymentConfig.alipay_params" type="textarea" placeholder="JSON格式" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="savePayment">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="打印配置" name="printer">
        <el-form :model="printerConfig" label-width="120px" class="settings-form">
          <el-form-item label="云打印机参数">
            <el-input v-model="printerConfig.printer_params" type="textarea" placeholder="JSON格式" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="savePrinter">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { tenant as tenantApi } from '../utils/api'

const activeTab = ref('basic')

const tenantInfo = reactive({
  id: '',
  name: '',
  tel: '',
  business_hours: ''
})

const takeoutConfig = reactive({
  enable_takeout: 0,
  min_delivery_amount: 0,
  delivery_fee: 0,
  delivery_range: ''
})

const paymentConfig = reactive({
  wx_pay_params: '',
  alipay_params: ''
})

const printerConfig = reactive({
  printer_params: ''
})

const loadTenantInfo = async () => {
  try {
    const res = await tenantApi.info()
    if (res.code === 200) {
      const data = res.data
      tenantInfo.id = data.id
      tenantInfo.name = data.name || ''
      tenantInfo.tel = data.tel || ''
      tenantInfo.business_hours = data.business_hours || ''
      
      takeoutConfig.enable_takeout = data.enable_takeout || 0
      takeoutConfig.min_delivery_amount = data.min_delivery_amount || 0
      takeoutConfig.delivery_fee = data.delivery_fee || 0
      takeoutConfig.delivery_range = data.delivery_range || ''
      
      paymentConfig.wx_pay_params = data.wx_pay_params || ''
      paymentConfig.alipay_params = data.alipay_params || ''
      
      printerConfig.printer_params = data.printer_params || ''
    }
  } catch (error) {
    ElMessage.error('获取店铺信息失败')
  }
}

const saveBasic = async () => {
  try {
    const res = await tenantApi.updateInfo({
      name: tenantInfo.name,
      tel: tenantInfo.tel,
      business_hours: tenantInfo.business_hours
    })
    if (res.code === 200) {
      ElMessage.success('保存成功')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const saveTakeout = async () => {
  try {
    const res = await tenantApi.updateTakeout({
      enable_takeout: takeoutConfig.enable_takeout,
      min_delivery_amount: takeoutConfig.min_delivery_amount,
      delivery_fee: takeoutConfig.delivery_fee,
      delivery_range: takeoutConfig.delivery_range
    })
    if (res.code === 200) {
      ElMessage.success('保存成功')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const savePayment = async () => {
  try {
    const res = await tenantApi.updatePayment({
      wx_pay_params: paymentConfig.wx_pay_params,
      alipay_params: paymentConfig.alipay_params
    })
    if (res.code === 200) {
      ElMessage.success('保存成功')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const savePrinter = async () => {
  try {
    const res = await tenantApi.updatePrinter({
      printer_params: printerConfig.printer_params
    })
    if (res.code === 200) {
      ElMessage.success('保存成功')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

onMounted(() => {
  loadTenantInfo()
})
</script>

<style scoped>
.settings-page {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.settings-tabs {
  margin-top: 10px;
}

.settings-form {
  padding: 20px;
}
</style>
