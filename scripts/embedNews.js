require('dotenv').config();
const { fetchFromRSS } = require('../services/rssIngestion');
const { getEmbeddings } = require('../services/embeddingService');
const { upsertToQdrant, createCollectionIfNotExists } = require('../services/vectorDbService');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Function to clear existing collection before adding new data
async function clearCollection() {
  try {
    console.log("Clearing existing collection...");
    // First make sure the collection exists
    await createCollectionIfNotExists();
    
    // Delete all points in the collection
    await axios.post(`${process.env.QDRANT_HOST}/collections/news-articles/points/delete`, {
      filter: {
        must: [
          {
            match_all: {}
          }
        ]
      }
    });
    console.log("✅ Collection cleared successfully.");
  } catch (error) {
    console.error("Error clearing collection:", error.message);
    if (error.response) {
      // If 404, the collection doesn't exist yet, which is fine
      if (error.response.status === 404) {
        console.log("Collection doesn't exist yet, will be created.");
        return;
      }
      console.error("Response data:", error.response.data);
    }
  }
}

// Function to validate articles before embedding
function validateArticles(articles) {
  return articles.filter(article => {
    // Check if article has a valid title (not just a URL)
    const hasValidTitle = article.title && 
                         article.title.length > 10 && 
                         !article.title.includes('outputType=xml');
    
    // Check if article has meaningful content
    const hasValidContent = article.content && article.content.length > 100;
    
    return hasValidTitle && hasValidContent;
  });
}

(async () => {
  try {
    // Clear existing collection first
    await clearCollection();
    
    // Fetch news articles
    console.log("\nFetching news articles from BBC RSS feeds...");
    const rawArticles = await fetchFromRSS(20);
    
    // The fetchFromRSS function already has fallback to sample data
    // so we should always have articles here, but double-check anyway
    if (!rawArticles || rawArticles.length === 0) {
      console.error("\n❌ No articles were fetched even after fallback. Cannot proceed with embedding.");
      process.exit(1);
    }
    
    // Validate articles to ensure we only embed proper content
    const validArticles = validateArticles(rawArticles);
    
    if (validArticles.length === 0) {
      console.error("\n❌ No valid articles found after filtering. Cannot proceed with embedding.");
      process.exit(1);
    }

    // Print titles for validation
    console.log(`\n📚 Articles to Embed: ${validArticles.length} valid articles found (out of ${rawArticles.length} total)`);
    validArticles.forEach((a, i) => {
      console.log(`${i + 1}. ${a.title.substring(0, 100)}...`);
    });

    // Generate embeddings
    console.log("\nGenerating embeddings...");
    const texts = validArticles.map(a => a.content);
    const vectors = await getEmbeddings(texts);

    if (!vectors || vectors.length === 0) {
      console.error("\n❌ Failed to generate embeddings. Cannot proceed.");
      process.exit(1);
    }

    console.log(`Generated ${vectors.length} embeddings.`);

    // Prepare items for Qdrant
    const items = validArticles.map((a, i) => ({
      id: uuidv4(),
      vector: vectors[i],
      payload: { 
        title: a.title, 
        content: a.content, 
        url: a.url || 'https://example.com/article',
        source: a.id && a.id.startsWith('sample-') ? 'sample' : 'reuters'
      }
    }));

    // Upload to Qdrant
    console.log("\nUploading to vector database...");
    if (items.length > 0) {
      await upsertToQdrant(items);
      console.log("\n✅ Embedding + upload complete.\n");
      console.log(`Added ${items.length} articles to the vector database.`);
      console.log("\nYou can now test your chatbot with queries related to these articles!");
    } else {
      console.error("\n❌ No items to upload to vector database.");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Error in embedNews script:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    process.exit(1);
  }
})();
