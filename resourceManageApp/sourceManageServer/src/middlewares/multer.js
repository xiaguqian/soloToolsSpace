const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { getFileExtension, getFileType } = require('../utils/fileHelper');

const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { sourceSystem = 'OTHER', accessPermission = 'public' } = req.body;
    const userId = req.user ? req.user.id : null;
    const extension = getFileExtension(file.originalname);
    const fileType = getFileType(extension);
    
    let destPath = path.join(
      config.storage.path,
      sourceSystem,
      accessPermission
    );
    
    if (accessPermission === 'private' && userId) {
      destPath = path.join(destPath, userId.toString());
    }
    
    destPath = path.join(destPath, fileType);
    ensureDirExists(destPath);
    
    req.fileDestPath = destPath;
    req.fileType = fileType;
    
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    const extension = getFileExtension(file.originalname);
    const fileName = `${uuidv4()}${extension}`;
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  const { sourceSystem = 'OTHER', accessPermission = 'public' } = req.body;
  
  if (!config.sourceSystems.includes(sourceSystem)) {
    return cb(new Error('不支持的来源系统'), false);
  }
  
  if (!config.accessPermissions.includes(accessPermission)) {
    return cb(new Error('不支持的访问权限'), false);
  }
  
  if (req.user && accessPermission === 'manage' && req.user.user_type !== config.userTypes.SYSTEM) {
    return cb(new Error('普通用户无法上传到manage目录'), false);
  }
  
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.storage.maxFileSize
  }
});

module.exports = {
  upload,
  ensureDirExists
};
