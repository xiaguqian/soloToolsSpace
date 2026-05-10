const resourceService = require('../services/resourceService');
const { success, error } = require('../utils/response');
const { upload } = require('../middlewares/multer');

const uploadSingleFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(error(400, '请上传文件'));
    }

    const result = await resourceService.uploadFile(req.file, req.body, req.user);
    return res.status(201).json(success(result, '上传成功'));
  } catch (err) {
    next(err);
  }
};

const uploadBatchFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(error(400, '请上传文件'));
    }

    const result = await resourceService.batchUpload(req.files, req.body, req.user);
    return res.status(201).json(success(result, '批量上传完成'));
  } catch (err) {
    next(err);
  }
};

const getResourceInfo = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const result = await resourceService.getResourceInfo(fileId, req.user);
    return res.json(success(result));
  } catch (err) {
    next(err);
  }
};

const getResourceListByTags = async (req, res, next) => {
  try {
    const { tagIds, page = 1, pageSize = 10, sourceSystem, accessPermission, fileType } = req.query;
    
    let tagIdArray = [];
    if (tagIds) {
      tagIdArray = Array.isArray(tagIds) ? tagIds : tagIds.split(',').map(id => parseInt(id.trim()));
    }

    const result = await resourceService.getResourceListByTags(tagIdArray, req.user, {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      sourceSystem,
      accessPermission,
      fileType
    });

    return res.json(success(result));
  } catch (err) {
    next(err);
  }
};

const downloadFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const { resource, filePath } = await resourceService.downloadFile(fileId, req.user);

    res.setHeader('Content-Type', resource.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resource.original_name)}"`);
    res.setHeader('X-Original-Filename', encodeURIComponent(resource.original_name));

    return res.download(filePath, resource.original_name);
  } catch (err) {
    next(err);
  }
};

const previewFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const { resource, filePath } = await resourceService.downloadFile(fileId, req.user);

    res.setHeader('Content-Type', resource.mime_type || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    return res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

const deleteResource = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    await resourceService.deleteResource(fileId, req.user);
    return res.json(success(null, '删除成功'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadSingleFile,
  uploadBatchFiles,
  getResourceInfo,
  getResourceListByTags,
  downloadFile,
  previewFile,
  deleteResource
};
