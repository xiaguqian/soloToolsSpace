const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Resource = sequelize.define('resources', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '资源ID'
  },
  file_id: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    comment: '文件唯一标识（UUID）'
  },
  original_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '原始文件名'
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '存储文件名'
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '文件存储路径'
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '文件大小（字节）'
  },
  file_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '文件类型: image/video/textfile/exefile等'
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'MIME类型'
  },
  source_system: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '来源系统编码（一级目录）'
  },
  access_permission: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '访问权限: public/private/manage（二级目录）'
  },
  owner_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '私有文件所属用户ID'
  },
  file_extension: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '文件扩展名'
  },
  batch_id: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: '批量上传批次号'
  },
  upload_user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '上传用户ID'
  },
  download_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '下载次数'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态: 1-正常, 0-已删除'
  }
}, {
  tableName: 'resources',
  comment: '资源文件表',
  indexes: [
    {
      name: 'idx_batch_id',
      fields: ['batch_id']
    },
    {
      name: 'idx_source_system',
      fields: ['source_system']
    },
    {
      name: 'idx_access_permission',
      fields: ['access_permission']
    },
    {
      name: 'idx_owner_id',
      fields: ['owner_id']
    }
  ]
});

module.exports = Resource;
