const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { Resource, UploadBatch, sequelize } = require('../models');
const { getFileExtension, getFileType, canAccessResource } = require('../utils/fileHelper');
const mimeTypes = require('mime-types');
const config = require('../config');

const uploadFile = async (file, metadata, user) => {
  const { sourceSystem = 'OTHER', accessPermission = 'public' } = metadata;
  const extension = getFileExtension(file.originalname);
  const fileType = getFileType(extension);
  
  const fileId = uuidv4();
  const relativePath = path.join(sourceSystem, accessPermission, 
    accessPermission === 'private' ? user.id.toString() : '', 
    fileType, file.filename);
  
  const resource = await Resource.create({
    file_id: fileId,
    original_name: file.originalname,
    file_name: file.filename,
    file_path: relativePath,
    file_size: file.size,
    file_type: fileType,
    mime_type: mimeTypes.lookup(file.originalname) || 'application/octet-stream',
    source_system: sourceSystem,
    access_permission: accessPermission,
    owner_id: accessPermission === 'private' ? user.id : null,
    file_extension: extension,
    upload_user_id: user.id,
    status: 1
  });

  return {
    id: resource.id,
    file_id: resource.file_id,
    original_name: resource.original_name,
    file_type: resource.file_type,
    file_size: resource.file_size,
    source_system: resource.source_system,
    access_permission: resource.access_permission
  };
};

const batchUpload = async (files, metadata, user) => {
  const batchId = uuidv4();
  const { sourceSystem = 'OTHER', accessPermission = 'public' } = metadata;
  
  const batch = await UploadBatch.create({
    batch_id: batchId,
    upload_user_id: user.id,
    source_system: sourceSystem,
    access_permission: accessPermission,
    total_count: files.length,
    status: 'uploading'
  });

  const results = {
    success: [],
    failed: []
  };

  for (const file of files) {
    try {
      const extension = getFileExtension(file.originalname);
      const fileType = getFileType(extension);
      const fileId = uuidv4();
      
      let relativePath = path.join(sourceSystem, accessPermission);
      if (accessPermission === 'private') {
        relativePath = path.join(relativePath, user.id.toString());
      }
      relativePath = path.join(relativePath, fileType, file.filename);

      const resource = await Resource.create({
        file_id: fileId,
        original_name: file.originalname,
        file_name: file.filename,
        file_path: relativePath,
        file_size: file.size,
        file_type: fileType,
        mime_type: mimeTypes.lookup(file.originalname) || 'application/octet-stream',
        source_system: sourceSystem,
        access_permission: accessPermission,
        owner_id: accessPermission === 'private' ? user.id : null,
        file_extension: extension,
        batch_id: batchId,
        upload_user_id: user.id,
        status: 1
      });

      results.success.push({
        id: resource.id,
        file_id: resource.file_id,
        original_name: resource.original_name
      });
    } catch (error) {
      results.failed.push({
        original_name: file.originalname,
        error: error.message
      });
    }
  }

  batch.success_count = results.success.length;
  batch.fail_count = results.failed.length;
  batch.status = results.failed.length === 0 ? 'completed' : (results.success.length > 0 ? 'completed' : 'failed');
  await batch.save();

  return {
    batch_id: batchId,
    total: files.length,
    success_count: results.success.length,
    fail_count: results.failed.length,
    file_ids: results.success.map(r => r.file_id),
    details: results
  };
};

const getResourceById = async (fileId, user) => {
  const resource = await Resource.findOne({
    where: { file_id: fileId, status: 1 }
  });

  if (!resource) {
    throw new Error('资源不存在');
  }

  if (!canAccessResource(resource, user)) {
    throw new Error('无权访问该资源');
  }

  return resource;
};

const getResourceListByTags = async (tagIds, user, options = {}) => {
  const { page = 1, pageSize = 10, sourceSystem, accessPermission, fileType } = options;
  
  const where = {
    status: 1
  };

  if (sourceSystem) where.source_system = sourceSystem;
  if (accessPermission) where.access_permission = accessPermission;
  if (fileType) where.file_type = fileType;

  if (user.user_type !== config.userTypes.SYSTEM) {
    where[sequelize.Op.or] = [
      { access_permission: 'public' },
      { 
        access_permission: 'private',
        owner_id: user.id
      }
    ];
  }

  const includeConditions = tagIds && tagIds.length > 0 ? [{
    model: require('../models').Tag,
    as: 'tags',
    where: {
      id: { [sequelize.Op.in]: tagIds }
    },
    through: { attributes: [] }
  }] : [];

  const { count, rows } = await Resource.findAndCountAll({
    where,
    include: includeConditions,
    attributes: {
      exclude: ['file_path']
    },
    order: [['created_at', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize,
    distinct: true
  });

  return {
    list: rows,
    total: count,
    page,
    pageSize
  };
};

const downloadFile = async (fileId, user) => {
  const resource = await getResourceById(fileId, user);
  
  const fullPath = path.join(config.storage.path, resource.file_path);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error('文件不存在');
  }

  resource.download_count += 1;
  await resource.save();

  return {
    resource,
    filePath: fullPath
  };
};

const deleteResource = async (fileId, user) => {
  const resource = await getResourceById(fileId, user);
  
  if (user.user_type !== config.userTypes.SYSTEM && 
      resource.upload_user_id !== user.id) {
    throw new Error('无权删除该资源');
  }

  resource.status = 0;
  resource.updated_by = user.id;
  await resource.save();

  return true;
};

const getResourceInfo = async (fileId, user) => {
  const resource = await Resource.findOne({
    where: { file_id: fileId, status: 1 },
    include: [{
      model: require('../models').Tag,
      as: 'tags',
      through: { attributes: [] }
    }]
  });

  if (!resource) {
    throw new Error('资源不存在');
  }

  if (!canAccessResource(resource, user)) {
    throw new Error('无权访问该资源');
  }

  return resource;
};

module.exports = {
  uploadFile,
  batchUpload,
  getResourceById,
  getResourceListByTags,
  downloadFile,
  deleteResource,
  getResourceInfo
};
