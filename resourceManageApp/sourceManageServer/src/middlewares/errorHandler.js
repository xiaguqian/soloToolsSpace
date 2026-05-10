const { serverError, badRequest, notFound, forbidden, unauthorized } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(unauthorized(err.message));
  }
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json(badRequest('参数验证失败', errors));
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json(badRequest('数据唯一约束冲突'));
  }
  
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json(badRequest('外键约束错误'));
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json(badRequest('文件大小超过限制'));
  }
  
  if (err.message.includes('不支持的') || err.message.includes('无法')) {
    return res.status(403).json(forbidden(err.message));
  }
  
  return res.status(500).json(serverError(err.message || '服务器内部错误'));
};

const notFoundHandler = (req, res, next) => {
  res.status(404).json(notFound('请求的资源不存在'));
};

module.exports = {
  errorHandler,
  notFoundHandler
};
