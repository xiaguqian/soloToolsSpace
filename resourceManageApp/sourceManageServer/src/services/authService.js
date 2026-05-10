const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const config = require('../config');

const login = async (username, password) => {
  const user = await User.findOne({
    where: { username }
  });

  if (!user) {
    throw new Error('用户名或密码错误');
  }

  if (user.status !== 1) {
    throw new Error('用户已被禁用');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('用户名或密码错误');
  }

  const token = generateToken({
    userId: user.id,
    username: user.username,
    userType: user.user_type
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      user_type: user.user_type
    }
  };
};

const createUser = async (userData, createdBy = null) => {
  const existingUser = await User.findOne({
    where: { username: userData.username }
  });

  if (existingUser) {
    throw new Error('用户名已存在');
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = await User.create({
    username: userData.username,
    password: hashedPassword,
    nickname: userData.nickname,
    user_type: userData.user_type || config.userTypes.NORMAL,
    status: 1,
    created_by: createdBy
  });

  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    user_type: user.user_type,
    status: user.status
  };
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error('用户不存在');
  }

  const isValidPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isValidPassword) {
    throw new Error('旧密码错误');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.updated_by = userId;
  await user.save();

  return true;
};

const resetPassword = async (userId, newPassword, operatorId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error('用户不存在');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.updated_by = operatorId;
  await user.save();

  return true;
};

module.exports = {
  login,
  createUser,
  changePassword,
  resetPassword
};
