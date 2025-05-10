const axios = require('axios');

// Configure Qdrant API headers
const getQdrantHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'api-key': process.env.QDRANT_API_KEY
  };
};

async function createCollectionIfNotExists() {
  try {
    // First check if collection exists
    try {
      const response = await axios.get(`${process.env.QDRANT_HOST}/collections/news-articles`, {
        headers: getQdrantHeaders()
      });
      console.log('Collection already exists:', response.data);
      return true;
    } catch (error) {
      // Collection doesn't exist, create it
      if (error.response && error.response.status === 404) {
        console.log('Collection does not exist, creating it now...');
        await axios.put(`${process.env.QDRANT_HOST}/collections/news-articles`, {
          vectors: {
            size: 768, // Jina embedding size
            distance: 'Cosine'
          }
        }, {
          headers: getQdrantHeaders()
        });
        console.log('Collection created successfully.');
        return true;
      } else {
        // Some other error occurred
        throw error;
      }
    }
  } catch (err) {
    console.error('Error creating collection:', err.message);
    return false;
  }
}

async function upsertToQdrant(items) {
  await createCollectionIfNotExists();

  await axios.put(`${process.env.QDRANT_HOST}/collections/news-articles/points`, {
    points: items
  }, {
    headers: getQdrantHeaders()
  });

  console.log('Uploaded vectors to Qdrant.');
}

async function queryQdrant(queryVector, k = 5) {
  // Make sure collection exists before querying
  const collectionExists = await createCollectionIfNotExists();
  
  if (!collectionExists) {
    console.log('Cannot query Qdrant: collection does not exist');
    return []; // Return empty array if collection doesn't exist
  }
  
  try {
    const res = await axios.post(`${process.env.QDRANT_HOST}/collections/news-articles/points/search`, {
      vector: queryVector,
      top: k,
      with_payload: true
    }, {
      headers: getQdrantHeaders()
    });

    return res.data.result || [];
  } catch (error) {
    console.error('Error querying Qdrant:', error.message);
    return []; // Return empty array on error
  }
}

module.exports = {
  createCollectionIfNotExists,
  upsertToQdrant,
  queryQdrant
};