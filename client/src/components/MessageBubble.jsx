export default function MessageBubble({ sender, text }) {
  const isUser = sender === 'user';
  
  // Function to format text with line breaks
  const formatText = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className={`flex items-start gap-2 my-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-blue-600' : 'bg-gray-700'}`}>
        {isUser ? (
          <span className="text-white text-sm">👤</span>
        ) : (
          <span className="text-white text-sm">🤖</span>
        )}
      </div>
      
      {/* Message bubble */}
      <div 
        className={`p-3 rounded-xl ${isUser 
          ? 'bg-blue-500 text-white rounded-tr-none' 
          : 'bg-gray-100 text-gray-800 rounded-tl-none'} 
          shadow-sm max-w-[85%] text-sm md:text-base`}
      >
        <div className="whitespace-pre-line">{formatText(text)}</div>
      </div>
    </div>
  );
}
