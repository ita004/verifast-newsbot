const redis = require('redis');

// Configure Redis client based on environment
const redisConfig = {};

// Start with the basic URL configuration
redisConfig.url = process.env.REDIS_URL;

// Add TLS options for production environments (like Render)
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  redisConfig.socket = {
    tls: true,
    rejectUnauthorized: false
  };
}

const client = redis.createClient(redisConfig);

client.connect();

async function getSession(id) {
  const data = await client.get(`session:${id}`);
  return data ? JSON.parse(data) : [];
}

async function updateSession(id, message) {
  const history = await getSession(id);
  history.push(message);
  await client.set(`session:${id}`, JSON.stringify(history), { EX: 3600 }); // 1 hr TTL
}

async function clearSession(id) {
    await client.del(`session:${id}`);
  }
module.exports = { getSession, updateSession, clearSession };
