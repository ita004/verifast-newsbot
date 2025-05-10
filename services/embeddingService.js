const axios = require('axios');

async function getEmbeddings(texts) {
  const res = await axios.post(
    'https://api.jina.ai/v1/embeddings',
    { input: texts, model: 'jina-embeddings-v2-base-en' },
    { headers: { Authorization: `Bearer ${process.env.JINA_API_KEY}` } }
  );
  return res.data.data.map(e => e.embedding);
}

module.exports = { getEmbeddings };
