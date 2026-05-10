const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UploadBatch = sequelize.define('upload_batches', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID'
  },
  batch_id: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    comment: '批次号（UUID）'
  },
  upload_user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '上传用户ID'
  },
  source_system: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '来源系统'
  },
  access_permission: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '访问权限'
  },
  total_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '文件总数'
  },
  success_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '成功数量'
  },
  fail_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '失败数量'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'uploading',
    comment: '状态: uploading-上传中, completed-已完成, failed-失败'
  }
}, {
  tableName: 'upload_batches',
  comment: '批量上传批次表',
  indexes: [
    {
      name: 'idx_upload_user',
      fields: ['upload_user_id']
    }
  ]
});

module.exports = UploadBatch;
