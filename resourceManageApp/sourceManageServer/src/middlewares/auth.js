const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');
const { unauthorized, forbidden } = require('../utils/response');
const config = require('../config');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(unauthorized('未提供认证令牌'));
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json(unauthorized('无效或过期的令牌'));
    }
    
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json(unauthorized('用户不存在'));
    }
    
    if (user.status !== 1) {
      return res.status(403).json(forbidden('用户已被禁用'));
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ code: 500, message: '认证过程出错', data: error.message });
  }
};

const requireSystemUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(unauthorized('未登录'));
  }
  
  if (req.user.user_type !== config.userTypes.SYSTEM) {
    return res.status(403).json(forbidden('需要系统用户权限'));
  }
  
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (decoded) {
        const user = await User.findByPk(decoded.userId);
        if (user && user.status === 1) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

module.exports = {
  authenticate,
  requireSystemUser,
  optionalAuth
};
