import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Shield, Zap, CreditCard, FileText, Home, Globe, Languages } from 'lucide-react';
import VoiceInterface from './VoiceInterface';
import { OpenAIService } from '../services/openai';

interface NavigationResult {
  title: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  language?: string;
}

const BrowserInterface: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [currentPage, setCurrentPage] = useState<NavigationResult>({
    title: 'Welcome to AskIT AI Browser',
    content: (
      <div className="text-center py-12">
        <Home className="mx-auto mb-6 h-16 w-16 text-gray-400" />
        <h2 className="text-3xl font-bold mb-4 text-gray-900">AskIT AI Browser 🇮🇳</h2>
        <p className="text-lg text-gray-600 mb-8">
          Speak in any Indian language and get instant access to government services
        </p>
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200 max-w-md mx-auto mb-6">
          <div className="flex items-center justify-center mb-3">
            <Languages className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm text-gray-700 font-medium">Try saying in any language:</p>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• "Bijli ka bill check karo" (Hindi)</li>
            <li>• "Aadhaar card status batao" (Hindi)</li>
            <li>• "Ration card kaise banaye" (Hindi)</li>
            <li>• "Check my electricity bill" (English)</li>
          </ul>
        </div>
        {!hasApiKey && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-md mx-auto">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-yellow-800 text-sm font-medium">
                OpenAI API key required for voice features
              </p>
            </div>
            <p className="text-yellow-700 text-xs mt-1">
              Add VITE_OPENAI_API_KEY to your environment variables
            </p>
          </div>
        )}
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
        console.log('API key check:', !!apiKey);
      } catch (error) {
        console.error('API key check failed:', error);
        setHasApiKey(false);
      }
    };
    
    checkApiKey();
  }, []);

  // Security: Input sanitization function to prevent XSS
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

  // Security: Validate voice input before processing
  const validateInput = useCallback((input: string): boolean => {
    // Check for reasonable length and content
    if (input.length > 200) return false;
    if (!/^[\w\s\-.,!?]+$/i.test(input)) return false;
    return true;
  }, []);

  // Enhanced navigation with AI analysis
  const simulateNavigation = useCallback(async (query: string, analysis?: any) => {
    setIsLoading(true);
    console.log('Simulating navigation for query:', query, 'with analysis:', analysis);
    
    const sanitizedQuery = sanitizeInput(query);
    
    if (!validateInput(query)) {
      console.warn('Invalid input detected:', query);
      setCurrentPage({
        title: 'Invalid Input',
        content: (
          <div className="text-center py-12">
            <Shield className="mx-auto mb-6 h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold mb-4 text-red-600">Security Warning</h2>
            <p className="text-gray-600">Invalid input detected. Please try a valid query.</p>
          </div>
        ),
        icon: <Shield className="h-4 w-4 text-red-500" />,
        language: 'en'
      });
      setIsLoading(false);
      return;
    }

    // Use AI analysis if available, otherwise fall back to keyword matching
    const intent = analysis?.intent || 'general_query';
    const entities = analysis?.entities || {};
    const language = analysis?.language || detectedLanguage;
    const simplifiedQuery = analysis?.simplifiedQuery || sanitizedQuery;

    console.log('Navigation details:', { intent, entities, language, simplifiedQuery });
    
    try {
      let pageContent: NavigationResult;

      if (intent === 'electricity_bill' || query.toLowerCase().includes('electricity') || query.toLowerCase().includes('bijli')) {
        console.log('Navigating to electricity bill portal');
        // Simplify complex portal language
        let simplifiedContent = "Your current electricity bill is ₹740. Due date is 10 September 2025. Units consumed: 145 kWh for August 2025 billing period.";
        
        if (hasApiKey) {
          try {
            simplifiedContent = await openAIServiceRef.current.simplifyContent(
              "Your current electricity bill is ₹740. Due date is 10 September 2025. Units consumed: 145 kWh for August 2025 billing period.",
              language
            );
          } catch (error) {
            console.warn('Content simplification failed, using default:', error);
          }
        }

        pageContent = {
          title: 'Electricity Bill Portal - BESCOM',
          content: (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border-2 border-black p-6 mb-6">
                <div className="flex items-center mb-4">
                  <Zap className="h-8 w-8 text-yellow-600 mr-3" />
                  <div>
                    <h2 className="text-2xl font-bold">Electricity Bill Status</h2>
                    {language !== 'en' && (
                      <p className="text-sm text-gray-600">Query: "{simplifiedQuery}"</p>
                    )}
                  </div>
                </div>
                
                {hasApiKey && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-blue-800 font-medium">AI Simplified Response:</p>
                    </div>
                    <p className="text-blue-700 mt-1">{simplifiedContent}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-gray-300 p-4 rounded">
                    <h3 className="font-semibold mb-2">Current Bill Details</h3>
                    <p className="text-sm text-gray-600 mb-1">Consumer ID: 123456789</p>
                    <p className="text-lg font-bold text-green-600">Amount Due: ₹740</p>
                    <p className="text-sm text-red-600">Due Date: 10 Sept 2025</p>
                  </div>
                  <div className="border border-gray-300 p-4 rounded">
                    <h3 className="font-semibold mb-2">Usage Summary</h3>
                    <p className="text-sm text-gray-600 mb-1">Units Consumed: 145 kWh</p>
                    <p className="text-sm text-gray-600 mb-1">Billing Period: Aug 2025</p>
                    <p className="text-sm text-green-600">Status: Active</p>
                  </div>
                </div>
                <button className="mt-4 bg-black text-white px-4 py-2 border-2 border-black hover:bg-gray-800 transition-colors">
                  Pay Now
                </button>
              </div>
            </div>
          ),
          icon: <Zap className="h-4 w-4 text-yellow-600" />,
          language
        };
      } else if (intent === 'aadhaar_status' || query.toLowerCase().includes('aadhaar') || query.toLowerCase().includes('aadhar')) {
        console.log('Navigating to Aadhaar portal');
        let simplifiedContent = "Your Aadhaar update is waiting because your bank details don't match your ID card.";
        
        if (hasApiKey) {
          try {
            simplifiedContent = await openAIServiceRef.current.simplifyContent(
              "Application status pending due to KYC mismatch. Document verification required.",
              language
            );
          } catch (error) {
            console.warn('Content simplification failed, using default:', error);
          }
        }

        pageContent = {
          title: 'Aadhaar Services - UIDAI',
          content: (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border-2 border-black p-6 mb-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h2 className="text-2xl font-bold">Aadhaar Status Portal</h2>
                    {language !== 'en' && (
                      <p className="text-sm text-gray-600">Query: "{simplifiedQuery}"</p>
                    )}
                  </div>
                </div>
                
                {hasApiKey && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-blue-800 font-medium">AI Simplified Response:</p>
                    </div>
                    <p className="text-blue-700 mt-1">{simplifiedContent}</p>
                  </div>
                )}

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Update Status: Pending</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your Aadhaar update request is pending due to KYC document mismatch.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-gray-300 p-4 rounded">
                    <h3 className="font-semibold mb-2">Request Details</h3>
                    <p className="text-sm text-gray-600 mb-1">URN: 123456789012</p>
                    <p className="text-sm text-gray-600 mb-1">Date Submitted: 25 Aug 2025</p>
                    <p className="text-sm text-orange-600">Status: Document Verification</p>
                  </div>
                  <div className="border border-gray-300 p-4 rounded">
                    <h3 className="font-semibold mb-2">Next Steps</h3>
                    <p className="text-sm text-gray-600 mb-2">Required: Clear photograph of PAN card</p>
                    <button className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 transition-colors">
                      Upload Document
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ),
          icon: <CreditCard className="h-4 w-4 text-blue-600" />,
          language
        };
      } else if (intent === 'general_query' && (query.toLowerCase().includes('government') || query.toLowerCase().includes('services') || query.toLowerCase().includes('portal'))) {
        console.log('Navigating to government services portal');
        pageContent = {
          title: 'Government Services Portal',
          content: (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border-2 border-black p-6 mb-6">
                <div className="flex items-center mb-6">
                  <FileText className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h2 className="text-2xl font-bold">Digital India Services</h2>
                    {language !== 'en' && (
                      <p className="text-sm text-gray-600">Query: "{simplifiedQuery}"</p>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border-2 border-gray-300 p-4 rounded hover:border-black transition-colors cursor-pointer">
                    <Zap className="h-8 w-8 text-yellow-600 mb-2" />
                    <h3 className="font-semibold mb-1">Electricity</h3>
                    <p className="text-sm text-gray-600">Bill payments & connection services</p>
                  </div>
                  <div className="border-2 border-gray-300 p-4 rounded hover:border-black transition-colors cursor-pointer">
                    <CreditCard className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold mb-1">Aadhaar</h3>
                    <p className="text-sm text-gray-600">Identity verification & updates</p>
                  </div>
                  <div className="border-2 border-gray-300 p-4 rounded hover:border-black transition-colors cursor-pointer">
                    <Shield className="h-8 w-8 text-green-600 mb-2" />
                    <h3 className="font-semibold mb-1">Tax Services</h3>
                    <p className="text-sm text-gray-600">Income tax filing & returns</p>
                  </div>
                </div>
              </div>
            </div>
          ),
          icon: <FileText className="h-4 w-4 text-green-600" />,
          language
        };
      } else {
        console.log('Navigating to search results');
        pageContent = {
          title: 'Search Results',
          content: (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border-2 border-black p-6 mb-6">
                <div className="flex items-center mb-4">
                  <Search className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <h2 className="text-2xl font-bold">Search Results</h2>
                    {language !== 'en' && (
                      <p className="text-sm text-gray-600">Query: "{simplifiedQuery}"</p>
                    )}
                  </div>
                </div>
                <p className="text-lg mb-4">Showing results for: <span className="font-bold">"{sanitizedQuery}"</span></p>
                
                {analysis && hasApiKey && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-blue-800 font-medium">AI Understanding:</p>
                    </div>
                    <p className="text-blue-700 mt-1">Intent: {analysis.intent}</p>
                    <p className="text-blue-700">Language: {analysis.language}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="border-l-4 border-purple-600 pl-4">
                    <h3 className="font-semibold text-purple-800">AskIT AI Assistant</h3>
                    <p className="text-gray-600">I can help you navigate government services, check bill statuses, and access digital India services through voice commands in multiple Indian languages.</p>
                  </div>
                  <div className="border-l-4 border-blue-600 pl-4">
                    <h3 className="font-semibold text-blue-800">Available Services</h3>
                    <p className="text-gray-600">Electricity bills, Aadhaar services, tax portals, and more government services accessible through multilingual voice navigation.</p>
                  </div>
                </div>
              </div>
            </div>
          ),
          icon: <Search className="h-4 w-4 text-purple-600" />,
          language
        };
      }

      setCurrentPage(pageContent);
      setDetectedLanguage(language);
      
    } catch (error) {
      console.error('Navigation error:', error);
      setCurrentPage({
        title: 'Error',
        content: (
          <div className="text-center py-12">
            <Shield className="mx-auto mb-6 h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold mb-4 text-red-600">Processing Error</h2>
            <p className="text-gray-600 mb-4">Failed to process your request. Please try again.</p>
            {!hasApiKey && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-md mx-auto">
                <p className="text-yellow-800 text-sm">
                  Note: OpenAI API key is required for advanced voice features
                </p>
              </div>
            )}
          </div>
        ),
        icon: <Shield className="h-4 w-4 text-red-500" />,
        language: 'en'
      });
    }
    
    setIsLoading(false);
  }, [sanitizeInput, validateInput, detectedLanguage, hasApiKey]);

  // Handle voice transcription and analysis
  const handleVoiceTranscription = useCallback((transcript: string, analysis: any) => {
    console.log('Voice transcription received:', transcript, analysis);
    setSearchValue(transcript);
    simulateNavigation(transcript, analysis);
  }, [simulateNavigation]);

  return (
    <div className="h-screen bg-white flex flex-col font-sans">
      {/* Browser Toolbar */}
      <div className="flex items-center p-3 border-b-2 border-black bg-gray-50">
        <div className="flex items-center space-x-2 mr-4">
          <div className="flex items-center">
            {currentPage.icon}
            <span className="ml-2 text-sm font-medium truncate">{currentPage.title}</span>
            {currentPage.language && currentPage.language !== 'en' && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                {currentPage.language.toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={`w-full px-3 py-2 border-2 border-black text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                isLoading ? 'bg-gray-50' : ''
              }`}
              placeholder="Say or type your query in any Indian language..."
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchValue.trim() && !isLoading) {
                  simulateNavigation(searchValue);
                }
              }}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          {/* Enhanced Voice Interface */}
          {hasApiKey ? (
            <VoiceInterface 
              onTranscription={handleVoiceTranscription}
              className="flex-shrink-0"
            />
          ) : (
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <Shield className="h-4 w-4" />
              <span>API key required</span>
            </div>
          )}
        </div>
      </div>

      {/* Page Content Area */}
      <div className={`flex-1 overflow-auto bg-gray-100 p-6 ${isLoading ? 'opacity-50' : ''}`}>
        {currentPage.content}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg">
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