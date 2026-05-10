const path = require('path');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;
const envFilePath = path.resolve(__dirname, '../../', envFile);

if (fs.existsSync(envFilePath)) {
  require('dotenv').config({ path: envFilePath });
} else {
  require('dotenv').config();
}

module.exports = {
  env,
  port: process.env.PORT || 3000,
  
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'resource_manage',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    dialect: process.env.DB_DIALECT || 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: process.env.REDIS_DB || 0
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  storage: {
    path: process.env.STORAGE_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800
  },
  
  sourceSystems: ['DAMM', 'OTHER'],
  
  accessPermissions: ['public', 'private', 'manage'],
  
  fileTypes: {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
    video: ['.mp4', '.avi', '.mov', '.wmv', '.flv'],
    textfile: ['.txt', '.doc', '.docx', '.pdf', '.xls', '.xlsx'],
    exefile: ['.exe', '.msi', '.bat', '.sh', '.zip', '.rar', '.7z']
  },
  
  userTypes: {
    NORMAL: 'normal',
    SYSTEM: 'system'
  },
  
  tagTypes: {
    PRIVATE: 'private',
    PUBLIC: 'public'
  },
  
  publicTagThreshold: 10
};
