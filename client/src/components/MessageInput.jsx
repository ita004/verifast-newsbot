import { useState, useRef, useEffect } from 'react';

export default function MessageInput({ onSend, isLoading }) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  // Auto-resize textarea based on content
  const handleInput = (e) => {
    const target = e.target;
    setMessage(target.value);
    
    // Reset height to auto to properly calculate new height
    target.style.height = 'auto';
    // Set new height based on scrollHeight (with max height)
    target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
  };

  return (
    <div className="p-4 border-t bg-white">
      <div className="flex gap-2 max-w-4xl mx-auto relative">
        <textarea
          ref={inputRef}
          className="flex-grow border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-[150px] text-gray-800"
          value={message}
          onChange={handleInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask about news events or any topic you're interested in..."
          disabled={isLoading}
          rows="1"
        />
        <button 
          className={`px-4 py-2 rounded-full w-12 h-12 flex items-center justify-center ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : message.trim() 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          } transition-colors`}
          onClick={handleSend}
          disabled={isLoading || !message.trim()}
          aria-label="Send message"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
            </svg>
          )}
        </button>
      </div>
      <div className="text-xs text-center text-gray-500 mt-2">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
