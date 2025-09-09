import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Shield, Zap, CreditCard, FileText, Home, Globe, Languages, Mic, MicOff, MessageCircle, User, Minus, Square, X, Volume2, ChevronLeft, ChevronRight, RotateCcw, Plus, MoreHorizontal, Loader2 } from 'lucide-react';
import VoiceInterface from './VoiceInterface';
import { OpenAIService } from '../services/openai';

interface NavigationResult {
  title: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  language?: string;
  url?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface Tab {
  id: string;
  title: string;
  url: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const BrowserInterface: React.FC = () => {
  const [searchValue, setSearchValue] = useState('Pay my electricity bill');
  const [isLoading, setIsLoading] = useState(true);
  const [processingStatus, setProcessingStatus] = useState('Processing voice command...');
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(true);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      title: 'BESCOM - Bill Payment',
      url: 'https://bescom.karnataka.gov.in',
      icon: <Zap className="h-3 w-3" />,
      isActive: true
    },
    {
      id: '2', 
      title: 'UIDAI - Aadhaar Services',
      url: 'https://uidai.gov.in',
      icon: <CreditCard className="h-3 w-3" />,
      isActive: false
    },
    {
      id: '3',
      title: 'Income Tax e-Filing',
      url: 'https://incometax.gov.in',
      icon: <FileText className="h-3 w-3" />,
      isActive: false
    }
  ]);
  
  const [currentPage, setCurrentPage] = useState<NavigationResult>({
    title: 'BESCOM - Electricity Bill Payment',
    url: 'https://bescom.karnataka.gov.in/bill-payment',
    content: (
      <div className="min-h-screen" style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url('/Taj Mahal With Indian Flag Colors In The Sky, India Independence Day, Taj Mahal Agra, India Background Image And Wallpaper for Free Download.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="max-w-6xl mx-auto p-8 space-y-8">
          {/* AI Assistant Status Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">AskIT AI Assistant</h3>
                  <p className="text-sm text-gray-600">✅ Automatically navigated to BESCOM portal</p>
                  <p className="text-sm text-gray-600">🔄 Auto-filling your consumer details...</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-green-600 font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Task in Progress</span>
                </div>
              </div>
            </div>
          </div>

          {/* BESCOM Portal Interface */}
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
            {/* Portal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-green-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">BESCOM</h1>
                    <p className="text-orange-100">Bangalore Electricity Supply Company Limited</p>
                    <p className="text-sm text-orange-100 mt-1">Government of Karnataka</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm text-orange-100">Consumer ID</p>
                    <p className="font-mono text-xl font-bold">123456789</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-filled Form Section */}
            <div className="p-8 space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  <p className="text-blue-800 font-medium">AskIT AI is automatically filling your details...</p>
                </div>
              </div>

              {/* Bill Summary - Auto-populated */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="font-bold text-red-800 mb-2">Outstanding Bill</h3>
                  <p className="text-4xl font-bold text-red-700">₹1,247</p>
                  <p className="text-sm text-red-600 mt-1">Due: Sept 15, 2025</p>
                  <div className="mt-3 text-xs text-red-600 bg-red-200 px-2 py-1 rounded-full inline-block">
                    OVERDUE
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="font-bold text-blue-800 mb-2">Current Usage</h3>
                  <p className="text-3xl font-bold text-blue-700">287 kWh</p>
                  <p className="text-sm text-blue-600 mt-1">August 2025</p>
                  <div className="mt-3 text-xs text-blue-600">
                    +23% from last month
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
                  <h3 className="font-bold text-green-800 mb-2">Connection Status</h3>
                  <p className="text-2xl font-bold text-green-700">Active</p>
                  <p className="text-sm text-green-600 mt-1">All systems OK</p>
                  <div className="mt-3 flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
              </div>

              {/* Auto-filled Payment Form */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Details</span>
                  <div className="ml-auto flex items-center space-x-2 text-green-600 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Auto-filled by AI</span>
                  </div>
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consumer Number</label>
                      <input 
                        type="text" 
                        value="123456789" 
                        className="w-full px-4 py-3 border-2 border-green-300 rounded-lg bg-green-50 font-mono text-lg"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Pay</label>
                      <input 
                        type="text" 
                        value="₹1,247.00" 
                        className="w-full px-4 py-3 border-2 border-green-300 rounded-lg bg-green-50 font-bold text-xl text-red-700"
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select className="w-full px-4 py-3 border-2 border-green-300 rounded-lg bg-green-50">
                        <option>UPI Payment</option>
                        <option>Net Banking</option>
                        <option>Credit/Debit Card</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                      <input 
                        type="text" 
                        value="+91 98765 43210" 
                        className="w-full px-4 py-3 border-2 border-green-300 rounded-lg bg-green-50 font-mono"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Action */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>✅ Details verified automatically</p>
                    <p>🔒 Secure payment gateway ready</p>
                  </div>
                  <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg">
                    Pay ₹1,247 Now
                  </button>
                </div>
              </div>

              {/* AI Progress Steps */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">AskIT AI Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700">Voice command recognized: "Pay my electricity bill"</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700">Automatically navigated to BESCOM portal</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700">Retrieved your consumer details</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-spin">
                      <Loader2 className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">Auto-filling payment form...</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-xs">4</span>
                    </div>
                    <span className="text-gray-400">Ready for payment confirmation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    icon: <Zap className="h-4 w-4" />,
    language: 'en'
  });
  
  const openAIServiceRef = useRef(new OpenAIService());

  // Initialize with demo state
  useEffect(() => {
    // Simulate initial loading and processing
    setTimeout(() => {
      setProcessingStatus('Navigating to BESCOM portal...');
    }, 1000);
    
    setTimeout(() => {
      setProcessingStatus('Auto-filling your details...');
    }, 2500);
    
    setTimeout(() => {
      setIsLoading(false);
      setProcessingStatus('');
      // Add initial AI messages
      setChatMessages([
        {
          id: '1',
          type: 'user',
          content: 'Pay my electricity bill',
          timestamp: new Date(Date.now() - 30000)
        },
        {
          id: '2',
          type: 'ai',
          content: 'I understand you want to pay your electricity bill. Let me help you with that right away.',
          timestamp: new Date(Date.now() - 25000)
        },
        {
          id: '3',
          type: 'ai',
          content: 'I\'ve automatically navigated to the BESCOM portal and found your outstanding bill of ₹1,247. I\'m now filling in your payment details.',
          timestamp: new Date(Date.now() - 10000)
        }
      ]);
    }, 4000);

    setHasApiKey(true);
  }, []);

  // Security: Input sanitization function
  const sanitizeInput = useCallback((input: string): string => {
    return input.replace(/[<>&"']/g, (match) => {
      const escapeMap: Record<string, string> = {
        '<': '<',
        '>': '>',
        '&': '&',
        '"': '"',
        "'": '&#39;'
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

  const handleTabClick = useCallback((tabId: string) => {
    setTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
  }, []);

  return (
    <div className="h-screen bg-gray-100 flex flex-col font-system-ui" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* macOS Window Frame */}
      <div className="bg-gray-200 border-b border-gray-300 rounded-t-xl">
        {/* Traffic Light Controls */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <button className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-sm">
            </button>
            <button className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors shadow-sm">
            </button>
            <button className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors shadow-sm">
            </button>
          </div>
          
          {/* Window Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <span className="text-sm font-medium text-gray-700">AskIT AI Browser</span>
          </div>
          
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>

        {/* Tab Bar */}
        <div className="flex items-center px-4 pb-2 space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
                tab.isActive 
                  ? 'bg-white text-gray-800 shadow-sm border-t border-l border-r border-gray-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span className="max-w-32 truncate">{tab.title}</span>
              {tab.isActive && (
                <X className="h-3 w-3 text-gray-400 hover:text-gray-600 ml-1" />
              )}
            </button>
          ))}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Browser Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          {/* Navigation Controls */}
          <div className="flex items-center space-x-1">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Address Bar */}
          <div className="flex-1 relative">
            <div className={`flex items-center bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 transition-all ${
              isLoading ? 'border-blue-400 bg-blue-50' : ''
            }`}>
              {/* Security Icon */}
              <div className="flex items-center space-x-2 mr-3">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-500">Secure</span>
              </div>

              {/* URL/Search Input */}
              <input
                type="text"
                value={isLoading ? searchValue : currentPage.url || 'https://bescom.karnataka.gov.in/bill-payment'}
                className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
                readOnly
              />

              {/* Voice Interface */}
              <div className="flex items-center space-x-2 ml-3">
                {isLoading && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs font-medium">{processingStatus}</span>
                  </div>
                )}
                
                <div className={`p-2 rounded-full transition-all ${
                  isVoiceActive ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}>
                  <Mic className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Browser Controls */}
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex bg-white">
        {/* Page Content */}
        <div className={`flex-1 overflow-auto transition-all duration-300 ${
          showChat ? 'mr-80' : ''
        }`}>
          {currentPage.content}
        </div>

        {/* AI Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">AskIT AI</span>
                    <p className="text-xs text-gray-600">Voice Assistant</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4 bg-gray-50">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    {message.content}
                    <div className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-sm text-gray-600">Processing your request...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-400 transition-colors"
                />
                <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                  <Mic className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserInterface;