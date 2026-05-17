const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

const authRouter = require('./routes/auth');
const productRouter = require('./routes/product');
const categoryRouter = require('./routes/category');
const tableRouter = require('./routes/table');
const orderRouter = require('./routes/order');
const statisticsRouter = require('./routes/statistics');
const tenantRouter = require('./routes/tenant');

const app = express();
const PORT = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/product', productRouter);
app.use('/api/category', categoryRouter);
app.use('/api/table', tableRouter);
app.use('/api/order', orderRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/tenant', tenantRouter);

app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: 'OK' });
});

app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

console.log('🔧 正在初始化服务...');
testConnection((success) => {
  if (!success) {
    console.error('❌ 数据库连接失败，请检查数据库配置');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 服务器启动成功: http://localhost:${PORT}`);
  });
});
