const path = require('path');
const config = require('../config');

const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

const getFileType = (extension) => {
  for (const [type, extensions] of Object.entries(config.fileTypes)) {
    if (extensions.includes(extension.toLowerCase())) {
      return type;
    }
  }
  return 'exefile';
};

const buildStoragePath = (sourceSystem, accessPermission, fileType, userId = null) => {
  let pathParts = [config.storage.path, sourceSystem, accessPermission];
  
  if (accessPermission === 'private' && userId) {
    pathParts.push(userId.toString());
  }
  
  pathParts.push(fileType);
  
  return pathParts.join(path.sep);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const validateAccessPermission = (accessPermission, user) => {
  if (accessPermission === 'manage') {
    return user.user_type === config.userTypes.SYSTEM;
  }
  return true;
};

const canAccessResource = (resource, user) => {
  if (user.user_type === config.userTypes.SYSTEM) {
    return true;
  }
  
  if (resource.access_permission === 'public') {
    return true;
  }
  
  if (resource.access_permission === 'private') {
    return resource.owner_id === user.id;
  }
  
  if (resource.access_permission === 'manage') {
    return false;
  }
  
  return false;
};

module.exports = {
  getFileExtension,
  getFileType,
  buildStoragePath,
  formatFileSize,
  validateAccessPermission,
  canAccessResource
};
