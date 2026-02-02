// src/config/redis.js
const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Redis retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

// Helper functions
const cacheGet = (key) => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, data) => {
      if (err) reject(err);
      resolve(data ? JSON.parse(data) : null);
    });
  });
};

const cacheSet = (key, value, expireSeconds = 3600) => {
  return new Promise((resolve, reject) => {
    redisClient.setex(key, expireSeconds, JSON.stringify(value), (err) => {
      if (err) reject(err);
      resolve(true);
    });
  });
};

const cacheDel = (key) => {
  return new Promise((resolve, reject) => {
    redisClient.del(key, (err) => {
      if (err) reject(err);
      resolve(true);
    });
  });
};

module.exports = {
  redisClient,
  cacheGet,
  cacheSet,
  cacheDel
};
