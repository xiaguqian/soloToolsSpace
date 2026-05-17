const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const endUserRoutes = require('./routes/endUser');
const statisticsRoutes = require('./routes/statistics');
const systemRoutes = require('./routes/system');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 8031;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', endUserRoutes);
app.use('/api/v1/statistics', statisticsRoutes);
app.use('/api/v1/system', systemRoutes);
app.use('/api/v1/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: '商户管理系统 API' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ code: 500, message: '服务器错误', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});