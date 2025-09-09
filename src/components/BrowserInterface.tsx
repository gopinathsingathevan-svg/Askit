import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Shield, Zap, CreditCard, FileText, Home, Globe, Languages, Mic, MicOff, MessageCircle, User, Minus, Square, X, Volume2 } from 'lucide-react';
import VoiceInterface from './VoiceInterface';
import { OpenAIService } from '../services/openai';

interface NavigationResult {
  title: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  language?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const BrowserInterface: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [currentPage, setCurrentPage] = useState<NavigationResult>({
    title: 'AskIT AI Browser',
    content: (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {/* AskIT Logo/Branding */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-4 mx-auto">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-light text-black mb-2">AskIT</h1>
          <p className="text-gray-600 text-lg">AI-Powered Government Services Browser</p>
        </div>

        {/* Demo Instructions */}
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-black mb-4">Try These Voice Commands:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-gray-700">"Pay my electricity bill"</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-gray-700">"Change my Aadhaar address"</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-gray-700">"Check tax filing status"</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-gray-700">"What does service number mean?"</span>
                </div>
              </div>
            </div>
          </div>

          {!hasApiKey && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Demo mode - Voice features require API configuration</span>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    icon: <Home className="h-4 w-4" />,
    language: 'en'
  });
  
  const openAIServiceRef = useRef(new OpenAIService());

  // Check if API key is available
  useEffect(() => {
    const checkApiKey = () => {
      try {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        setHasApiKey(!!apiKey);
      } catch (error) {
        console.error('API key check failed:', error);
        setHasApiKey(false);
      }
    };
    
    checkApiKey();
  }, []);

  // Security: Input sanitization function
  const sanitizeInput = useCallback((input: string): string => {
    return input.replace(/[<>&"']/g, (match) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return escapeMap[match] || match;
    });
  }, []);

  // Add chat message
  const addChatMessage = useCallback((type: 'user' | 'ai', content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, message]);
    setShowChat(true);
  }, []);

  // Enhanced navigation with AI analysis
  const simulateNavigation = useCallback(async (query: string, analysis?: any) => {
    setIsLoading(true);
    
    const sanitizedQuery = sanitizeInput(query);
    
    // Add user message to chat
    addChatMessage('user', sanitizedQuery);
    
    try {
      const intent = analysis?.intent || 'general_query';
      const entities = analysis?.entities || {};
      const language = analysis?.language || detectedLanguage;
      const simplifiedQuery = analysis?.simplifiedQuery || sanitizedQuery;
      
      let pageContent: NavigationResult;
      let aiResponse = '';

      if (intent === 'electricity_bill' || query.toLowerCase().includes('electricity') || query.toLowerCase().includes('bijli') || query.toLowerCase().includes('pay')) {
        aiResponse = "I'll help you pay your electricity bill. Let me open the BESCOM portal for you.";
        
        pageContent = {
          title: 'BESCOM - Electricity Bill Payment',
          content: (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Portal Header */}
              <div className="bg-white border-2 border-black rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-black">BESCOM Portal</h2>
                      <p className="text-gray-600">Bangalore Electricity Supply Company</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Consumer ID</p>
                    <p className="font-mono text-lg">123456789</p>
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold text-black mb-2">Current Bill</h3>
                    <p className="text-3xl font-bold text-black">₹740</p>
                    <p className="text-sm text-gray-600">Due: Sept 10, 2025</p>
                  </div>
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h3 className="font-semibold text-black mb-2">Usage</h3>
                    <p className="text-2xl font-bold text-gray-700">145 kWh</p>
                    <p className="text-sm text-gray-600">August 2025</p>
                  </div>
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h3 className="font-semibold text-black mb-2">Status</h3>
                    <p className="text-lg font-semibold text-green-600">Active</p>
                    <p className="text-sm text-gray-600">Connection OK</p>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">Payment Options</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button className="border-2 border-black bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                      Pay ₹740 Now
                    </button>
                    <button className="border-2 border-gray-300 bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      Schedule Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ),
          icon: <Zap className="h-4 w-4" />,
          language
        };
      } else if (intent === 'aadhaar_status' || query.toLowerCase().includes('aadhaar') || query.toLowerCase().includes('address')) {
        aiResponse = "I'll guide you through changing your Aadhaar address. Here's the UIDAI portal with step-by-step instructions.";
        
        pageContent = {
          title: 'UIDAI - Aadhaar Address Update',
          content: (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Portal Header */}
              <div className="bg-white border-2 border-black rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-black">UIDAI Portal</h2>
                    <p className="text-gray-600">Unique Identification Authority of India</p>
                  </div>
                </div>

                {/* Step-by-step Guide */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">Address Update Process</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                      <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-semibold text-black">Verify Identity</h4>
                        <p className="text-gray-600 text-sm">Enter your 12-digit Aadhaar number</p>
                        <input 
                          type="text" 
                          placeholder="XXXX XXXX XXXX" 
                          className="mt-2 px-3 py-2 border border-gray-300 rounded w-full max-w-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-semibold text-gray-600">Upload Documents</h4>
                        <p className="text-gray-500 text-sm">Proof of address (utility bill, bank statement, etc.)</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-semibold text-gray-600">Review & Submit</h4>
                        <p className="text-gray-500 text-sm">Verify new address details and submit request</p>
                      </div>
                    </div>
                  </div>

                  <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                    Continue to Step 1
                  </button>
                </div>
              </div>
            </div>
          ),
          icon: <CreditCard className="h-4 w-4" />,
          language
        };
      } else if (query.toLowerCase().includes('service number') || query.toLowerCase().includes('what does')) {
        aiResponse = "A service number is your unique identifier for government services. It helps track your applications and requests. Each service (electricity, gas, water) has its own service number printed on your bills.";
        
        pageContent = {
          title: 'AskIT AI - Service Number Explanation',
          content: (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white border-2 border-black rounded-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-black">Service Number Explained</h2>
                    <p className="text-gray-600">Understanding your government service identifiers</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-black mb-3">What is a Service Number?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      A service number is your unique identifier for government services. It helps track your applications, 
                      bills, and requests. Think of it like your account number for each service.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-black mb-2">Where to Find It</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• On your electricity bill (top right)</li>
                        <li>• Gas connection documents</li>
                        <li>• Water bill statements</li>
                        <li>• Service application receipts</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-black mb-2">Why It's Important</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Tracks your service history</li>
                        <li>• Required for payments</li>
                        <li>• Needed for complaints</li>
                        <li>• Used for service updates</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
          icon: <MessageCircle className="h-4 w-4" />,
          language
        };
      } else {
        aiResponse = `I understand you're asking about: "${sanitizedQuery}". Let me help you find the right government service.`;
        
        pageContent = {
          title: 'AskIT AI - Government Services',
          content: (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border-2 border-black rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-black">Available Services</h2>
                    <p className="text-gray-600">Choose a service or ask me anything</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-black transition-colors cursor-pointer group">
                    <Zap className="h-8 w-8 text-gray-600 group-hover:text-black mb-3" />
                    <h3 className="font-semibold text-black mb-2">Electricity</h3>
                    <p className="text-sm text-gray-600">Bill payments, new connections, complaints</p>
                  </div>
                  <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-black transition-colors cursor-pointer group">
                    <CreditCard className="h-8 w-8 text-gray-600 group-hover:text-black mb-3" />
                    <h3 className="font-semibold text-black mb-2">Aadhaar</h3>
                    <p className="text-sm text-gray-600">Updates, corrections, status checks</p>
                  </div>
                  <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-black transition-colors cursor-pointer group">
                    <FileText className="h-8 w-8 text-gray-600 group-hover:text-black mb-3" />
                    <h3 className="font-semibold text-black mb-2">Tax Services</h3>
                    <p className="text-sm text-gray-600">Filing, refunds, compliance</p>
                  </div>
                </div>
              </div>
            </div>
          ),
          icon: <Search className="h-4 w-4" />,
          language
        };
      }

      // Add AI response to chat
      addChatMessage('ai', aiResponse);
      setCurrentPage(pageContent);
      setDetectedLanguage(language);
      
    } catch (error) {
      console.error('Navigation error:', error);
      addChatMessage('ai', 'I encountered an error processing your request. Please try again.');
    }
    
    setIsLoading(false);
  }, [sanitizeInput, detectedLanguage, addChatMessage]);

  // Handle voice transcription
  const handleVoiceTranscription = useCallback((transcript: string, analysis: any) => {
    setSearchValue(transcript);
    setIsVoiceActive(false);
    simulateNavigation(transcript, analysis);
  }, [simulateNavigation]);

  const handleVoiceStart = useCallback(() => {
    setIsVoiceActive(true);
  }, []);

  const handleVoiceStop = useCallback(() => {
    setIsVoiceActive(false);
  }, []);

  return (
    <div className="h-screen bg-white flex flex-col font-sans">
      {/* Mac-style Window Controls & Tab Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
        {/* Window Controls */}
        <div className="flex items-center space-x-2">
          <button className="w-3 h-3 bg-gray-400 rounded-full hover:bg-gray-500 transition-colors">
            <X className="w-2 h-2 text-gray-600 mx-auto" />
          </button>
          <button className="w-3 h-3 bg-gray-400 rounded-full hover:bg-gray-500 transition-colors">
            <Minus className="w-2 h-2 text-gray-600 mx-auto" />
          </button>
          <button className="w-3 h-3 bg-gray-400 rounded-full hover:bg-gray-500 transition-colors">
            <Square className="w-1.5 h-1.5 text-gray-600 mx-auto" />
          </button>
        </div>

        {/* Active Tab */}
        <div className="flex-1 flex justify-center">
          <div className="bg-white border border-gray-300 rounded-t-lg px-4 py-1 max-w-xs">
            <div className="flex items-center space-x-2">
              {currentPage.icon}
              <span className="text-sm font-medium text-black truncate">{currentPage.title}</span>
              {currentPage.language && currentPage.language !== 'en' && (
                <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                  {currentPage.language.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      </div>

      {/* Search/Command Interface */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto relative">
          <div className={`relative flex items-center bg-gray-50 border-2 rounded-full transition-all duration-200 ${
            isVoiceActive ? 'border-black bg-white shadow-lg' : 'border-gray-200 hover:border-gray-300'
          }`}>
            {/* AskIT Logo/Icon in idle state */}
            {!searchValue && !isVoiceActive && (
              <div className="absolute left-4 flex items-center space-x-2 text-gray-400">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">AskIT</span>
              </div>
            )}
            
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={`w-full px-4 py-3 bg-transparent text-base focus:outline-none transition-all ${
                !searchValue && !isVoiceActive ? 'pl-20' : 'pl-4'
              } ${isVoiceActive ? 'text-black' : 'text-gray-700'}`}
              placeholder={isVoiceActive ? "Listening..." : "Ask me anything about government services..."}
              disabled={isLoading || isVoiceActive}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchValue.trim() && !isLoading) {
                  simulateNavigation(searchValue);
                }
              }}
            />
            
            {/* Voice Interface */}
            <div className="absolute right-2">
              {hasApiKey ? (
                <VoiceInterface 
                  onTranscription={handleVoiceTranscription}
                  onStart={handleVoiceStart}
                  onStop={handleVoiceStop}
                  className="flex-shrink-0"
                />
              ) : (
                <div className="p-2 text-gray-400">
                  <Mic className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>

          {/* Voice Activity Indicator */}
          {isVoiceActive && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
              <div className="flex items-center space-x-2 bg-black text-white px-3 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Listening...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Page Content */}
        <div className={`flex-1 overflow-auto bg-gray-50 transition-all duration-300 ${
          showChat ? 'mr-80' : ''
        }`}>
          <div className="p-6">
            {currentPage.content}
          </div>
        </div>

        {/* AI Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-black" />
                  <span className="font-semibold text-black">AskIT Assistant</span>
                </div>
                <button 
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                      message.type === 'user'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Ask a follow-up question..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black transition-colors"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      simulateNavigation(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button className="p-2 text-gray-400 hover:text-black transition-colors">
                  <Mic className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-full shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            <span className="text-sm font-medium">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowserInterface;