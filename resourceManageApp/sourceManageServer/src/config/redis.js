const { createClient } = require('redis');
const config = require('./index');

let redisClient = null;

const initRedis = async () => {
  const options = {
    url: `redis://${config.redis.host}:${config.redis.port}`,
    database: config.redis.db
  };

  if (config.redis.password) {
    options.password = config.redis.password;
  }

  redisClient = createClient(options);

  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  redisClient.on('connect', () => console.log('Redis connected successfully'));

  try {
    await redisClient.connect();
    console.log('Redis connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to Redis:', error);
  }

  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Please call initRedis first.');
  }
  return redisClient;
};

module.exports = {
  initRedis,
  getRedisClient
};
