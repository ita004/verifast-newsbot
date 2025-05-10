require('dotenv').config();
const axios = require('axios');

/**
 * Script to view the contents of the Qdrant vector database
 * Run with: node scripts/viewVectorDb.js
 */

async function getQdrantCollectionInfo() {
  try {
    const res = await axios.get(`${process.env.QDRANT_HOST}/collections/news-articles`);
    console.log('\n📊 Collection Information:');
    console.log(JSON.stringify(res.data, null, 2));
    return res.data;
  } catch (error) {
    console.error('Error getting collection info:', error.message);
    if (error.response && error.response.status === 404) {
      console.log('Collection "news-articles" does not exist yet. You need to run embedNews.js first.');
    }
    return null;
  }
}

async function getQdrantPoints(limit = 10) {
  try {
    // Get collection info first to check if it exists
    const collectionInfo = await getQdrantCollectionInfo();
    if (!collectionInfo) return;

    // Scroll through points to get all of them
    const res = await axios.post(`${process.env.QDRANT_HOST}/collections/news-articles/points/scroll`, {
      limit: limit,
      with_payload: true,
      with_vector: false // Set to true if you want to see the vectors too
    });

    console.log(`\n📝 Found ${res.data.result.points.length} articles in the vector database:`);
    
    // Display each article's title and a preview of the content
    res.data.result.points.forEach((point, index) => {
      console.log(`\n${index + 1}. ${point.payload.title}`);
      console.log(`   ID: ${point.id}`);
      console.log(`   URL: ${point.payload.url || 'N/A'}`);
      console.log(`   Content Preview: ${point.payload.content.substring(0, 100)}...`);
    });

    return res.data.result.points;
  } catch (error) {
    console.error('Error getting points:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return [];
  }
}

// Run a sample query to see what results would be returned for a specific query
async function runSampleQuery(query = "climate change") {
  try {
    // First, we need to get an embedding for our query
    // This requires the embeddingService
    const { getEmbeddings } = require('../services/embeddingService');
    
    console.log(`\n🔍 Running sample query: "${query}"`);
    
    // Get embedding for the query
    const embeddings = await getEmbeddings([query]);
    if (!embeddings || embeddings.length === 0) {
      console.error('Failed to generate embedding for query');
      return;
    }
    
    // Query Qdrant
    const res = await axios.post(`${process.env.QDRANT_HOST}/collections/news-articles/points/search`, {
      vector: embeddings[0],
      top: 3,
      with_payload: true
    });
    
    console.log(`\n✨ Top 3 relevant articles for "${query}":`);
    res.data.result.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.payload.title} (Score: ${item.score.toFixed(4)})`);
      console.log(`   Content Preview: ${item.payload.content.substring(0, 150)}...`);
    });
    
    return res.data.result;
  } catch (error) {
    console.error('Error running sample query:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return [];
  }
}

// Main function to run the script
async function main() {
  console.log('📚 Viewing Qdrant Vector Database Contents');
  
  // Get all points
  await getQdrantPoints();
  
  // Run a sample query
  await runSampleQuery("climate change");
  
  // You can add more sample queries here
  await runSampleQuery("technology news");
}

// Run the script
main().catch(console.error);
