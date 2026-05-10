const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { sequelize, testConnection } = require('./config/database');
const { initRedis } = require('./config/redis');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'Resource Management API',
    version: '1.0.0'
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await testConnection();
    await sequelize.sync({ alter: false });
    console.log('Database models synchronized');
    
    await initRedis();
    
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Environment: ${config.env}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
