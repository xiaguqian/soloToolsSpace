const authService = require('../services/authService');
const { success, error } = require('../utils/response');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json(error(400, '用户名和密码不能为空'));
    }

    const result = await authService.login(username, password);
    return res.json(success(result, '登录成功'));
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { username, password, nickname } = req.body;

    if (!username || !password) {
      return res.status(400).json(error(400, '用户名和密码不能为空'));
    }

    const result = await authService.createUser({
      username,
      password,
      nickname,
      user_type: 'normal'
    });

    return res.status(201).json(success(result, '注册成功'));
  } catch (err) {
    next(err);
  }
};

const createSystemUser = async (req, res, next) => {
  try {
    const { username, password, nickname } = req.body;

    if (!username || !password) {
      return res.status(400).json(error(400, '用户名和密码不能为空'));
    }

    const result = await authService.createUser({
      username,
      password,
      nickname,
      user_type: 'system'
    }, req.user.id);

    return res.status(201).json(success(result, '系统用户创建成功'));
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json(error(400, '旧密码和新密码不能为空'));
    }

    await authService.changePassword(req.user.id, oldPassword, newPassword);
    return res.json(success(null, '密码修改成功'));
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json(error(400, '用户ID和新密码不能为空'));
    }

    await authService.resetPassword(userId, newPassword, req.user.id);
    return res.json(success(null, '密码重置成功'));
  } catch (err) {
    next(err);
  }
};

const getCurrentUser = (req, res) => {
  const user = {
    id: req.user.id,
    username: req.user.username,
    nickname: req.user.nickname,
    user_type: req.user.user_type,
    status: req.user.status
  };
  return res.json(success(user));
};

module.exports = {
  login,
  register,
  createSystemUser,
  changePassword,
  resetPassword,
  getCurrentUser
};
