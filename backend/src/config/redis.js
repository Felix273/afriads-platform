// src/config/redis.js
const redis = require('redis');
require('dotenv').config();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;
const redisUrl = process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`;

const redisClient = redis.createClient({
  url: redisUrl,
  password: redisPassword,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error('Redis max retries reached');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

let isConnected = false;

redisClient.on('connect', () => {
  isConnected = true;
  console.log('✅ Redis connected successfully');
});

redisClient.on('ready', () => {
  isConnected = true;
});

redisClient.on('error', (err) => {
  isConnected = false;
  console.warn('⚠️  Redis connection warning:', err.message);
});

// Non-blocking auto-connect
if (process.env.NODE_ENV !== 'test') {
  redisClient.connect().catch((err) => {
    console.warn('⚠️  Could not connect to Redis server (caching will fallback gracefully):', err.message);
  });
}

// Resilient Promise-based cache helpers
const cacheGet = async (key) => {
  if (!isConnected) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn('Redis cacheGet warning:', err.message);
    return null;
  }
};

const cacheSet = async (key, value, expireSeconds = 3600) => {
  if (!isConnected) return false;
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: expireSeconds });
    return true;
  } catch (err) {
    console.warn('Redis cacheSet warning:', err.message);
    return false;
  }
};

const cacheDel = async (key) => {
  if (!isConnected) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (err) {
    console.warn('Redis cacheDel warning:', err.message);
    return false;
  }
};

module.exports = {
  redisClient,
  cacheGet,
  cacheSet,
  cacheDel
};
