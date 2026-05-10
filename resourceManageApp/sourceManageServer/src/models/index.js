const User = require('./User');
const Resource = require('./Resource');
const Tag = require('./Tag');
const ResourceTag = require('./ResourceTag');
const UploadBatch = require('./UploadBatch');

User.hasMany(Resource, {
  foreignKey: 'upload_user_id',
  as: 'uploadedResources'
});

Resource.belongsTo(User, {
  foreignKey: 'upload_user_id',
  as: 'uploadUser'
});

User.hasMany(Resource, {
  foreignKey: 'owner_id',
  as: 'ownedResources'
});

Resource.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner'
});

User.hasMany(Tag, {
  foreignKey: 'owner_id',
  as: 'privateTags'
});

Tag.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner'
});

User.hasMany(UploadBatch, {
  foreignKey: 'upload_user_id',
  as: 'uploadBatches'
});

UploadBatch.belongsTo(User, {
  foreignKey: 'upload_user_id',
  as: 'uploadUser'
});

UploadBatch.hasMany(Resource, {
  foreignKey: 'batch_id',
  sourceKey: 'batch_id',
  as: 'batchResources'
});

Resource.belongsTo(UploadBatch, {
  foreignKey: 'batch_id',
  targetKey: 'batch_id',
  as: 'uploadBatch'
});

Resource.belongsToMany(Tag, {
  through: ResourceTag,
  foreignKey: 'resource_id',
  otherKey: 'tag_id',
  as: 'tags'
});

Tag.belongsToMany(Resource, {
  through: ResourceTag,
  foreignKey: 'tag_id',
  otherKey: 'resource_id',
  as: 'resources'
});

User.hasMany(ResourceTag, {
  foreignKey: 'tagged_by',
  as: 'taggedResources'
});

ResourceTag.belongsTo(User, {
  foreignKey: 'tagged_by',
  as: 'taggedByUser'
});

module.exports = {
  User,
  Resource,
  Tag,
  ResourceTag,
  UploadBatch
};
