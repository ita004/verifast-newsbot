const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { queryQdrant } = require('../services/vectorDbService');
const { generateGeminiResponse } = require('../services/geminiService');
const { getEmbeddings } = require('../services/embeddingService');
const { getSession, updateSession } = require('../utils/sessionManager');
const { clearSession } = require('../utils/sessionManager');


// POST /api/chat
router.post('/', async (req, res) => {
  const { message, session_id } = req.body;
  const sessionId = session_id || uuidv4();

  try {
    // Get previous conversation history if available
    const history = await getSession(sessionId);
    
    // Get relevant news articles based on user query
    const userEmbedding = await getEmbeddings([message]);
    const results = await queryQdrant(userEmbedding[0], 5);
    
    // Format the context from relevant news articles
    let newsContext = '';
    if (results && results.length > 0) {
      newsContext = '\n\nRelevant news information:\n' + 
        results.map((r, i) => {
          const title = r.payload.title || 'Untitled Article';
          const content = r.payload.content || '';
          const url = r.payload.url || '';
          return `[Article ${i+1}] Title: "${title}"\nSource: ${url}\nContent: ${content}`;
        }).join('\n\n');
    }
    
    // Format conversation history
    let conversationHistory = '';
    if (history && history.length > 0) {
      conversationHistory = '\n\nConversation history:\n' + 
        history.map(h => `User: ${h.user}\nAI: ${h.bot}`).join('\n\n');
    }
    
    // Create a comprehensive prompt with system instructions
    const prompt = `You are a sophisticated news assistant that provides detailed information about current events.

    INSTRUCTIONS:
    1. Answer the user's question based ONLY on the relevant news information provided below.
    2. Provide comprehensive, detailed responses that thoroughly explain the topic.
    3. If multiple articles are relevant, synthesize information from all of them.
    4. Include specific facts, figures, quotes, and details from the articles when available.
    5. If the relevant information is not available in the context, acknowledge that you don't have that specific information.
    6. Maintain a professional, journalistic tone.
    7. Format your response in a readable way with paragraphs where appropriate.
    8. Do not make up information or facts not present in the articles.
    9. Do not reference the article numbers in your response.
    
    ${newsContext}
    
    ${conversationHistory}\n\nUser: ${message}\nAI:`;

    const reply = await generateGeminiResponse(prompt);

    // Save the conversation
    await updateSession(sessionId, { user: message, bot: reply });

    res.json({ reply, session_id: sessionId });
  } catch (err) {
    console.error('Chat error:', err);
    // Return a more user-friendly error message
    res.status(500).json({ 
      error: 'Sorry, I encountered an issue processing your request. Please try again.', 
      session_id: sessionId 
    });
  }
});

router.get('/session/:id', async (req, res) => {
  try {
    const history = await getSession(req.params.id);
    res.json({ history });
  } catch (err) {
    console.error('Fetch session error:', err);
    res.status(500).json({ error: 'Failed to retrieve session history' });
  }
});
router.post('/reset', async (req, res) => {
  const { session_id } = req.body;
  try {
    await clearSession(session_id);
    res.json({ message: 'Session reset successfully' });
  } catch (err) {
    console.error('Reset session error:', err);
    res.status(500).json({ error: 'Failed to reset session' });
  }
});

module.exports = router;
