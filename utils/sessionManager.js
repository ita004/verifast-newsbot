const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });

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
