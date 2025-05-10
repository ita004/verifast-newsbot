import { useEffect, useState, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { sendMessage, fetchSession, resetSession } from '../api/api';
import { v4 as uuidv4 } from 'uuid';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem('newsbot_session_id');
    return saved || uuidv4();
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('newsbot_session_id', sessionId);
  }, [sessionId]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const history = await fetchSession(sessionId);
        if (history && history.length > 0) {
          const formattedMessages = history.flatMap(item => [
            { sender: 'user', text: item.user },
            { sender: 'bot', text: item.bot }
          ]);
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHistory();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (text) => {
    try {
      setIsLoading(true);
      // Add user message immediately
      setMessages(prev => [...prev, { sender: 'user', text }]);
      
      // Send to backend
      const { reply } = await sendMessage(text, sessionId);
      
      // Add bot response
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Sorry, I encountered an error processing your request. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsLoading(true);
      await resetSession(sessionId);
      setMessages([]);
      // Generate a new session ID
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
    } catch (error) {
      console.error('Error resetting session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm py-3 px-4 border-b border-gray-200 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <h1 className="text-xl font-bold flex items-center text-gray-800">
            <span className="bg-blue-600 text-white p-2 rounded-lg mr-3 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </span>
            <span>Verifast NewsBot</span>
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">RAG-Powered</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500 hidden md:block">
              Session ID: {sessionId.substring(0, 8)}...
            </div>
            <button 
              className="text-sm text-red-600 border border-red-300 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 shadow-sm"
              onClick={handleReset}
              disabled={isLoading}
              aria-label="Reset conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Session
            </button>
          </div>
        </div>
      </header>
      
      {/* Main chat area */}
      <main className="flex-grow overflow-hidden max-w-5xl w-full mx-auto px-4 py-6">
        <div className="h-full flex flex-col bg-white rounded-xl shadow-sm">
          {/* Welcome banner - only shown when no messages */}
          {messages.length === 0 && !isLoading && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold mb-2">Welcome to NewsBot!</h2>
              <p className="opacity-90">Ask me about recent news events or any topic you're interested in.</p>
            </div>
          )}
          
          {/* Messages area */}
          <div className="flex-grow overflow-y-auto p-4 flex flex-col">
            {messages.length === 0 && !isLoading ? (
              <div className="flex-grow flex items-center justify-center text-gray-500 flex-col p-10">
                <div className="bg-blue-50 p-6 rounded-xl max-w-lg w-full">
                  <div className="text-4xl mb-4 flex justify-center">💬</div>
                  <h3 className="font-medium text-lg text-center text-gray-700 mb-2">Try asking about:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                    <SuggestionButton onClick={handleSend} text="What's happening between India and Pakistan?" />
                    <SuggestionButton onClick={handleSend} text="Tell me about the new Pope" />
                    <SuggestionButton onClick={handleSend} text="Latest news about Gaza aid" />
                    <SuggestionButton onClick={handleSend} text="What's new in space exploration?" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <MessageBubble key={idx} sender={msg.sender} text={msg.text} />
                ))}
                {isLoading && (
                  <div className="flex items-start gap-2 my-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-700">
                      <span className="text-white text-sm">🤖</span>
                    </div>
                    <div className="bg-gray-100 text-gray-500 p-3 rounded-xl rounded-tl-none shadow-sm">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <MessageInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-2 text-center text-xs text-gray-500">
        <div className="max-w-5xl mx-auto px-4">
          Powered by RAG (Retrieval-Augmented Generation) with Gemini API
        </div>
      </footer>
    </div>
  );
}

// Helper component for suggestion buttons
function SuggestionButton({ text, onClick }) {
  return (
    <button 
      className="text-left p-2 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-50 transition-colors"
      onClick={() => onClick(text)}
    >
      {text}
    </button>
  );
}
