const success = (data = null, message = 'success') => {
  return {
    code: 200,
    message,
    data
  };
};

const error = (code = 500, message = 'error', data = null) => {
  return {
    code,
    message,
    data
  };
};

const badRequest = (message = 'Bad Request', data = null) => {
  return error(400, message, data);
};

const unauthorized = (message = 'Unauthorized', data = null) => {
  return error(401, message, data);
};

const forbidden = (message = 'Forbidden', data = null) => {
  return error(403, message, data);
};

const notFound = (message = 'Not Found', data = null) => {
  return error(404, message, data);
};

const serverError = (message = 'Internal Server Error', data = null) => {
  return error(500, message, data);
};

module.exports = {
  success,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError
};
