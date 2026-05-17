const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
