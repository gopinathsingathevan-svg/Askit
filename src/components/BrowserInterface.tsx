import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Send, MessageCircle, Loader2, Mic } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const BrowserInterface: React.FC = () => {
  const [urlValue, setUrlValue] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m AskIT AI, your voice-enabled assistant for Indian government services. You can ask me to help with electricity bills, Aadhaar services, tax filing, and more. Try saying "Pay my electricity bill" or type your request below.',
      timestamp: new Date(Date.now() - 60000)
    }
  ]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Add chat message
  const addChatMessage = useCallback((type: 'user' | 'ai', content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, message]);
  }, []);

  // Handle chat submission
  const handleChatSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    addChatMessage('user', userMessage);
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      let aiResponse = '';
      const lowerInput = userMessage.toLowerCase();
      
      if (lowerInput.includes('electricity') || lowerInput.includes('bijli') || lowerInput.includes('bill')) {
        aiResponse = 'I can help you pay your electricity bill! Let me navigate to the BESCOM portal and auto-fill your details. I\'ll need to access your consumer number - would you like me to proceed with the payment process?';
      } else if (lowerInput.includes('aadhaar') || lowerInput.includes('aadhar')) {
        aiResponse = 'I\'ll help you with Aadhaar services. I can check your Aadhaar status, help with updates, or guide you through the verification process. What specific Aadhaar service do you need?';
      } else if (lowerInput.includes('tax') || lowerInput.includes('income tax')) {
        aiResponse = 'I can assist with income tax services including e-filing, checking refund status, or downloading forms. Let me know what tax-related task you need help with.';
      } else if (lowerInput.includes('ration') || lowerInput.includes('pds')) {
        aiResponse = 'I can help you with ration card services including application, status check, or updates. Which ration card service do you need assistance with?';
      } else {
        aiResponse = `I understand you're asking about: "${userMessage}". I can help you navigate Indian government services, pay bills, check application statuses, and more. Could you be more specific about what service you need?`;
      }
      
      addChatMessage('ai', aiResponse);
      setIsLoading(false);
    }, 1500);
  }, [chatInput, isLoading, addChatMessage]);

  // Handle URL bar submission
  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!urlValue.trim()) return;
    
    // Add URL query as chat message
    addChatMessage('user', `Navigate to: ${urlValue}`);
    addChatMessage('ai', `I'll help you navigate to ${urlValue} and assist with any tasks on that website. What would you like to do there?`);
    setUrlValue('');
  }, [urlValue, addChatMessage]);

  return (
    <div className="h-screen bg-white flex flex-col" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Chrome-style URL Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <form onSubmit={handleUrlSubmit} className="max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="Search or enter URL"
              className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                title="Voice input"
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-8">
        {/* Chat Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-4">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-light text-gray-800 mb-2">AskIT AI Assistant</h1>
          <p className="text-gray-600">Voice-enabled assistant for Indian government services</p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-auto mb-6 space-y-4 min-h-0">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-6 py-4 rounded-2xl shadow-sm ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-gray-50 text-gray-800 border border-gray-200 rounded-bl-md'
                }`}
              >
                <p className="text-base leading-relaxed">{message.content}</p>
                <div className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-md px-6 py-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="text-gray-600">AskIT AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-200 pt-6">
          <form onSubmit={handleChatSubmit} className="relative">
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask me anything about government services..."
              disabled={isLoading}
              className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {[
              'Pay electricity bill',
              'Check Aadhaar status', 
              'File income tax',
              'Apply for ration card'
            ].map((action) => (
              <button
                key={action}
                onClick={() => {
                  setChatInput(action);
                  chatInputRef.current?.focus();
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserInterface;