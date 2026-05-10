const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const config = require('../config');

const Tag = sequelize.define('tags', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '标签ID'
  },
  tag_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '标签名称'
  },
  tag_type: {
    type: DataTypes.ENUM(config.tagTypes.PRIVATE, config.tagTypes.PUBLIC),
    allowNull: false,
    defaultValue: config.tagTypes.PRIVATE,
    comment: '标签类型: private-私有, public-公共'
  },
  owner_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '私有标签所属用户ID'
  },
  user_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '使用该标签的用户数量'
  },
  usage_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '标签使用次数'
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '标签颜色'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态: 1-启用, 0-禁用'
  }
}, {
  tableName: 'tags',
  comment: '标签表',
  indexes: [
    {
      name: 'idx_tag_name',
      fields: ['tag_name']
    },
    {
      name: 'idx_owner_id',
      fields: ['owner_id']
    }
  ]
});

module.exports = Tag;
