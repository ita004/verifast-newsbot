const axios = require('axios');

async function createCollectionIfNotExists() {
  try {
    await axios.put(`${process.env.QDRANT_HOST}/collections/news-articles`, {
      vectors: {
        size: 768, // Jina embedding size
        distance: 'Cosine'
      }
    });
    console.log('Collection created or already exists.');
  } catch (err) {
    console.error('Error creating collection:', err.message);
  }
}

async function upsertToQdrant(items) {
  await createCollectionIfNotExists();

  await axios.put(`${process.env.QDRANT_HOST}/collections/news-articles/points`, {
    points: items
  });

  console.log('Uploaded vectors to Qdrant.');
}

async function queryQdrant(queryVector, k = 5) {
  const res = await axios.post(`${process.env.QDRANT_HOST}/collections/news-articles/points/search`, {
    vector: queryVector,
    top: k,
    with_payload: true
  });

  return res.data.result;
}

module.exports = {
  createCollectionIfNotExists,
  upsertToQdrant,
  queryQdrant
};