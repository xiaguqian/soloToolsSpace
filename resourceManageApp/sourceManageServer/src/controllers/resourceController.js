const resourceService = require('../services/resourceService');
const { success, error } = require('../utils/response');
const { upload } = require('../middlewares/multer');
const fs = require('fs');
const path = require('path');

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
    const result = await resourceService.downloadFile(fileId, req.user);
    const { resource, filePath } = result;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json(error(404, '文件不存在'));
    }

    const fileName = resource.original_name;
    const encodedFileName = encodeURIComponent(fileName).replace(/['()]/g, escape).replace(/\*/g, '%2A');
    
    res.setHeader('Content-Type', resource.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
    res.setHeader('X-Original-Filename', encodedFileName);
    res.setHeader('Content-Length', resource.file_size);

    return res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          return res.status(500).json(error(500, '文件下载失败'));
        }
      }
    });
  } catch (err) {
    console.error('Download controller error:', err);
    if (!res.headersSent) {
      next(err);
    }
  }
};

const previewFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const result = await resourceService.downloadFile(fileId, req.user);
    const { resource, filePath } = result;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json(error(404, '文件不存在'));
    }

    const ext = path.extname(resource.original_name).toLowerCase();
    let contentType = resource.mime_type;

    if (!contentType || contentType === 'application/octet-stream') {
      switch (ext) {
        case '.txt':
          contentType = 'text/plain; charset=utf-8';
          break;
        case '.html':
        case '.htm':
          contentType = 'text/html; charset=utf-8';
          break;
        case '.css':
          contentType = 'text/css; charset=utf-8';
          break;
        case '.js':
          contentType = 'application/javascript; charset=utf-8';
          break;
        case '.json':
          contentType = 'application/json; charset=utf-8';
          break;
        case '.pdf':
          contentType = 'application/pdf';
          break;
        default:
          contentType = 'application/octet-stream';
      }
    } else if (ext === '.txt') {
      contentType = 'text/plain; charset=utf-8';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const stat = fs.statSync(filePath);
    res.setHeader('Content-Length', stat.size);

    return res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Preview error:', err);
        if (!res.headersSent) {
          return res.status(500).json(error(500, '文件预览失败'));
        }
      }
    });
  } catch (err) {
    console.error('Preview controller error:', err);
    if (!res.headersSent) {
      next(err);
    }
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
