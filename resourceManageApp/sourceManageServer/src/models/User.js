const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const config = require('../config');

const User = sequelize.define('users', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '用户ID'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码'
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '昵称'
  },
  user_type: {
    type: DataTypes.ENUM(config.userTypes.NORMAL, config.userTypes.SYSTEM),
    allowNull: false,
    defaultValue: config.userTypes.NORMAL,
    comment: '用户类型: normal-普通用户, system-系统用户'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态: 1-启用, 0-禁用'
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '创建人ID'
  },
  updated_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '更新人ID'
  }
}, {
  tableName: 'users',
  comment: '用户表'
});

module.exports = User;
