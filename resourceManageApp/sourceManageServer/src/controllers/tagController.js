const tagService = require('../services/tagService');
const { success, error } = require('../utils/response');

const createTag = async (req, res, next) => {
  try {
    const { tagName, tagType } = req.body;

    if (!tagName) {
      return res.status(400).json(error(400, '标签名称不能为空'));
    }

    const result = await tagService.createTag(tagName, req.user.id, tagType);
    return res.status(201).json(success(result, '标签创建成功'));
  } catch (err) {
    next(err);
  }
};

const getTagList = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, keyword, tagType } = req.query;

    const result = await tagService.getTagList(req.user.id, {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      keyword,
      tagType
    });

    return res.json(success(result));
  } catch (err) {
    next(err);
  }
};

const updateTag = async (req, res, next) => {
  try {
    const { tagId } = req.params;
    const { tagName, color } = req.body;

    const result = await tagService.updateTag(parseInt(tagId), { tagName, color }, req.user.id);
    return res.json(success(result, '标签更新成功'));
  } catch (err) {
    next(err);
  }
};

const deleteTag = async (req, res, next) => {
  try {
    const { tagId } = req.params;
    await tagService.deleteTag(parseInt(tagId), req.user.id);
    return res.json(success(null, '标签删除成功'));
  } catch (err) {
    next(err);
  }
};

const batchTagResources = async (req, res, next) => {
  try {
    const { resourceIds, tagNames } = req.body;

    if (!resourceIds || resourceIds.length === 0) {
      return res.status(400).json(error(400, '请选择要打标的资源'));
    }

    if (!tagNames || tagNames.length === 0) {
      return res.status(400).json(error(400, '请输入标签'));
    }

    const result = await tagService.batchTagResources(resourceIds, tagNames, req.user.id);
    return res.json(success(result, '批量打标完成'));
  } catch (err) {
    next(err);
  }
};

const removeTagFromResource = async (req, res, next) => {
  try {
    const { resourceId, tagId } = req.params;
    await tagService.removeTagFromResource(parseInt(resourceId), parseInt(tagId), req.user.id);
    return res.json(success(null, '移除标签成功'));
  } catch (err) {
    next(err);
  }
};

const getTagsByResource = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const result = await tagService.getTagsByResource(parseInt(resourceId), req.user.id);
    return res.json(success(result));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTag,
  getTagList,
  updateTag,
  deleteTag,
  batchTagResources,
  removeTagFromResource,
  getTagsByResource
};
