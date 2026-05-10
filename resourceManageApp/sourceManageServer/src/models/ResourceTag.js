const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ResourceTag = sequelize.define('resource_tags', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID'
  },
  resource_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '资源ID'
  },
  tag_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '标签ID'
  },
  tagged_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '打标用户ID'
  }
}, {
  tableName: 'resource_tags',
  comment: '资源标签关联表',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      name: 'idx_resource_tag',
      fields: ['resource_id', 'tag_id'],
      unique: true
    },
    {
      name: 'idx_tag_id',
      fields: ['tag_id']
    }
  ]
});

module.exports = ResourceTag;
