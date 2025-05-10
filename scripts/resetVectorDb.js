require('dotenv').config();
const axios = require('axios');

/**
 * Script to completely reset the vector database by deleting and recreating the collection
 * This is a more thorough approach than just deleting points
 */

async function resetVectorDatabase() {
  try {
    console.log('🗑️ Attempting to delete the entire collection...');
    
    // First try to delete the collection
    try {
      await axios.delete(`${process.env.QDRANT_HOST}/collections/news-articles`);
      console.log('✅ Collection successfully deleted.');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('Collection did not exist, nothing to delete.');
      } else {
        console.error('Error deleting collection:', error.message);
        if (error.response) {
          console.error('Response data:', error.response.data);
        }
      }
    }
    
    // Then create a new collection
    console.log('\n🆕 Creating a new collection...');
    await axios.put(`${process.env.QDRANT_HOST}/collections/news-articles`, {
      vectors: {
        size: 768, // Jina embedding size
        distance: 'Cosine'
      }
    });
    
    console.log('✅ New collection created successfully.');
    console.log('\n🎉 Vector database has been reset!');
    console.log('Now you can run the embedNews.js script to populate it with articles.');
    
  } catch (error) {
    console.error('❌ Error resetting vector database:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the script
resetVectorDatabase().catch(console.error);
