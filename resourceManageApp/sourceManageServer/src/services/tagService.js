const { Op } = require('sequelize');
const { Tag, ResourceTag, Resource, sequelize } = require('../models');
const config = require('../config');

const checkAndPromoteToPublic = async (tagId) => {
  const tag = await Tag.findByPk(tagId);
  
  if (tag && tag.tag_type === config.tagTypes.PRIVATE && 
      tag.user_count >= config.publicTagThreshold) {
    tag.tag_type = config.tagTypes.PUBLIC;
    tag.owner_id = null;
    await tag.save();
    return true;
  }
  
  return false;
};

const createTag = async (tagName, userId, tagType = config.tagTypes.PRIVATE) => {
  let tag = await Tag.findOne({
    where: {
      tag_name: tagName,
      [Op.or]: [
        { tag_type: config.tagTypes.PUBLIC },
        {
          tag_type: config.tagTypes.PRIVATE,
          owner_id: userId
        }
      ]
    }
  });

  if (tag) {
    if (tag.tag_type === config.tagTypes.PUBLIC || 
        (tag.tag_type === config.tagTypes.PRIVATE && tag.owner_id === userId)) {
      return tag;
    }
  }

  tag = await Tag.create({
    tag_name: tagName,
    tag_type: tagType,
    owner_id: tagType === config.tagTypes.PRIVATE ? userId : null,
    user_count: 1,
    usage_count: 0,
    status: 1
  });

  return tag;
};

const getTagList = async (userId, options = {}) => {
  const { page = 1, pageSize = 20, keyword, tagType } = options;
  
  const where = {
    status: 1
  };

  if (tagType) {
    where.tag_type = tagType;
  }

  if (keyword) {
    where.tag_name = { [Op.like]: `%${keyword}%` };
  }

  where[Op.or] = [
    { tag_type: config.tagTypes.PUBLIC },
    {
      tag_type: config.tagTypes.PRIVATE,
      owner_id: userId
    }
  ];

  const { count, rows } = await Tag.findAndCountAll({
    where,
    order: [
      ['tag_type', 'DESC'],
      ['usage_count', 'DESC'],
      ['created_at', 'DESC']
    ],
    offset: (page - 1) * pageSize,
    limit: pageSize
  });

  return {
    list: rows,
    total: count,
    page,
    pageSize
  };
};

const updateTag = async (tagId, tagData, userId) => {
  const tag = await Tag.findByPk(tagId);

  if (!tag) {
    throw new Error('标签不存在');
  }

  if (tag.tag_type === config.tagTypes.PUBLIC) {
    throw new Error('公共标签不可修改');
  }

  if (tag.owner_id !== userId) {
    throw new Error('只能修改自己的私有标签');
  }

  if (tagData.tag_name && tagData.tag_name !== tag.tag_name) {
    const existingTag = await Tag.findOne({
      where: {
        tag_name: tagData.tag_name,
        owner_id: userId,
        tag_type: config.tagTypes.PRIVATE
      }
    });

    if (existingTag) {
      throw new Error('标签名已存在');
    }
  }

  if (tagData.tag_name) tag.tag_name = tagData.tag_name;
  if (tagData.color) tag.color = tagData.color;
  
  await tag.save();

  return tag;
};

const deleteTag = async (tagId, userId) => {
  const tag = await Tag.findByPk(tagId);

  if (!tag) {
    throw new Error('标签不存在');
  }

  if (tag.tag_type === config.tagTypes.PUBLIC) {
    throw new Error('公共标签不可删除');
  }

  if (tag.owner_id !== userId) {
    throw new Error('只能删除自己的私有标签');
  }

  tag.status = 0;
  await tag.save();

  await ResourceTag.destroy({
    where: { tag_id: tagId }
  });

  return true;
};

const batchTagResources = async (resourceIds, tagNames, userId) => {
  const results = {
    success: 0,
    failed: 0,
    resources: []
  };

  const tags = [];
  for (const tagName of tagNames) {
    const tag = await createTag(tagName, userId);
    tags.push(tag);
  }

  for (const resourceId of resourceIds) {
    const resourceResult = {
      resource_id: resourceId,
      success: true,
      tags: [],
      errors: []
    };

    const resource = await Resource.findOne({
      where: {
        id: resourceId,
        status: 1
      }
    });

    if (!resource) {
      resourceResult.success = false;
      resourceResult.errors.push('资源不存在');
      results.failed++;
      results.resources.push(resourceResult);
      continue;
    }

    const resourceTags = await ResourceTag.findAll({
      where: {
        resource_id: resourceId
      }
    });
    
    const existingTagIds = resourceTags.map(rt => rt.tag_id);

    for (const tag of tags) {
      try {
        if (existingTagIds.includes(tag.id)) {
          resourceResult.tags.push({
            tag_id: tag.id,
            tag_name: tag.tag_name,
            already_exists: true
          });
          continue;
        }

        await ResourceTag.create({
          resource_id: resourceId,
          tag_id: tag.id,
          tagged_by: userId
        });

        const taggedByUsers = await ResourceTag.findAll({
          where: { tag_id: tag.id },
          attributes: ['tagged_by'],
          group: ['tagged_by']
        });

        tag.user_count = taggedByUsers.length;
        tag.usage_count += 1;
        await tag.save();

        await checkAndPromoteToPublic(tag.id);

        resourceResult.tags.push({
          tag_id: tag.id,
          tag_name: tag.tag_name,
          already_exists: false
        });
      } catch (error) {
        resourceResult.errors.push(error.message);
        resourceResult.success = false;
      }
    }

    if (resourceResult.success) {
      results.success++;
    } else {
      results.failed++;
    }

    results.resources.push(resourceResult);
  }

  return results;
};

const removeTagFromResource = async (resourceId, tagId, userId) => {
  const resourceTag = await ResourceTag.findOne({
    where: {
      resource_id: resourceId,
      tag_id: tagId
    }
  });

  if (!resourceTag) {
    throw new Error('标签未关联到此资源');
  }

  await resourceTag.destroy();

  const tag = await Tag.findByPk(tagId);
  if (tag) {
    tag.usage_count = Math.max(0, tag.usage_count - 1);
    
    const remainingUses = await ResourceTag.count({
      where: { tag_id: tagId }
    });
    
    tag.usage_count = remainingUses;
    
    if (remainingUses === 0 && tag.tag_type === config.tagTypes.PRIVATE) {
      await tag.destroy();
    } else {
      await tag.save();
    }
  }

  return true;
};

const getTagsByResource = async (resourceId, userId) => {
  const resource = await Resource.findOne({
    where: { id: resourceId, status: 1 }
  });

  if (!resource) {
    throw new Error('资源不存在');
  }

  const resourceTags = await ResourceTag.findAll({
    where: { resource_id: resourceId },
    include: [{
      model: Tag,
      as: 'tags',
      where: {
        status: 1,
        [Op.or]: [
          { tag_type: config.tagTypes.PUBLIC },
          {
            tag_type: config.tagTypes.PRIVATE,
            owner_id: userId
          }
        ]
      }
    }]
  });

  return resourceTags.map(rt => rt.tag);
};

module.exports = {
  createTag,
  getTagList,
  updateTag,
  deleteTag,
  batchTagResources,
  removeTagFromResource,
  getTagsByResource,
  checkAndPromoteToPublic
};
