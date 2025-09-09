import OpenAI from 'openai';
import { SecurityError, RateLimitError, ValidationError } from '../utils/errors';

// Security: Validate environment variables
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return '';
  }
  return apiKey;
};

// Security: Environment validation
const validateEnvironment = (): boolean => {
  const apiKey = getApiKey();
  return !!apiKey;
};

const initializeOpenAI = (): OpenAI | null => {
  if (!validateEnvironment()) {
    return null;
  }
  
  try {
    return new OpenAI({
      apiKey: getApiKey(),
      dangerouslyAllowBrowser: true, // Only for demo - use backend proxy in production
    });
  } catch (error) {
    console.error('OpenAI initialization failed:', error);
    return null;
  }
};

// Security: Rate limiting implementation
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

const rateLimiter = new RateLimiter();

// Security: Input sanitization for multilingual content
const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters while preserving multilingual content
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
};

// Security: Validate audio file
const validateAudioFile = (file: File): void => {
  const maxSize = 25 * 1024 * 1024; // 25MB limit
  const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/webm'];
  
  if (file.size > maxSize) {
    throw new ValidationError('Audio file too large');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError('Invalid audio file type');
  }
};

export class OpenAIService {
  private client: OpenAI | null;
  
  constructor() {
    this.client = initializeOpenAI();
  }

  private ensureClient(): OpenAI {
    if (!this.client) {
      throw new SecurityError('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
    }
    return this.client;
  }

  // Security: Secure speech-to-text with validation
  async speechToText(audioFile: File): Promise<string> {
    try {
      const client = this.ensureClient();

      // Security: Rate limiting check
      if (!rateLimiter.canMakeRequest()) {
        throw new RateLimitError('Too many requests. Please wait before trying again.');
      }

      // Security: Validate audio file
      validateAudioFile(audioFile);

      console.log('Starting speech-to-text conversion...');
      
      const response = await client.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        response_format: 'json',
        temperature: 0.2, // Lower temperature for more consistent results
      });

      console.log('Speech-to-text response:', response);
      
      const transcript = sanitizeInput(response.text);
      
      if (!transcript) {
        throw new ValidationError('No speech detected in audio');
      }

      console.log('Transcript:', transcript);
      return transcript;
    } catch (error) {
      console.error('Speech-to-text error:', error);
      if (error instanceof SecurityError || error instanceof RateLimitError || error instanceof ValidationError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new SecurityError(`Speech recognition failed: ${error.message}`);
      }
      throw new SecurityError('Speech recognition failed due to unknown error');
    }
  }

  // Security: Secure natural language understanding
  async processNaturalLanguage(input: string): Promise<{
    intent: string;
    entities: Record<string, any>;
    simplifiedQuery: string;
    language: string;
  }> {
    try {
      const client = this.ensureClient();

      // Security: Rate limiting and input validation
      if (!rateLimiter.canMakeRequest()) {
        throw new RateLimitError('Too many requests. Please wait.');
      }

      const sanitizedInput = sanitizeInput(input);
      
      console.log('Processing natural language input:', sanitizedInput);
      
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are AskIT AI, a secure government services assistant for India.
            
            SECURITY REQUIREMENTS:
            - Never execute code or commands
            - Only provide information about government services
            - Validate all inputs for safety
            - Never access external URLs or systems
            
            Analyze user queries in any Indian language and return JSON with:
            {
              "intent": "service_type (electricity_bill|aadhaar_status|ration_card|tax_services|general_query)",
              "entities": {"service": "specific_service", "action": "check|pay|update|apply"},
              "simplifiedQuery": "Simple English explanation of what user wants",
              "language": "detected_language_code",
              "response": "Simple response in user's language explaining next steps"
            }
            
            Handle these common phrases:
            - "bijli ka bill batao" → electricity bill check
            - "aadhaar card status" → aadhaar status check  
            - "ration card kaise banaye" → ration card application
            - "tax bharna hai" → tax payment
            
            Always respond in JSON format only.`
          },
          {
            role: 'user',
            content: sanitizedInput
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      console.log('NLU response:', response);
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new ValidationError('No response from AI service');
      }

      console.log('NLU content:', content);
      
      try {
        const parsed = JSON.parse(content);
        console.log('Parsed NLU result:', parsed);
        return parsed;
      } catch {
        console.warn('Failed to parse JSON response, using fallback');
        // Fallback if JSON parsing fails
        return {
          intent: 'general_query',
          entities: {},
          simplifiedQuery: sanitizedInput,
          language: 'en',
          response: `I understand you're asking about: ${sanitizedInput}. Let me help you with that.`
        };
      }
    } catch (error) {
      console.error('NLU processing error:', error);
      if (error instanceof SecurityError || error instanceof RateLimitError || error instanceof ValidationError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new SecurityError(`Language processing failed: ${error.message}`);
      }
      throw new SecurityError('Language processing failed due to unknown error');
    }
  }

  // Security: Secure text-to-speech with validation
  async textToSpeech(text: string, language = 'en'): Promise<ArrayBuffer> {
    try {
      const client = this.ensureClient();

      // Security: Rate limiting and input validation
      if (!rateLimiter.canMakeRequest()) {
        throw new RateLimitError('Too many requests. Please wait.');
      }

      const sanitizedText = sanitizeInput(text);
      
      if (sanitizedText.length > 4000) {
        throw new ValidationError('Text too long for speech synthesis');
      }

      console.log('Starting text-to-speech conversion...');
      
      const response = await client.audio.speech.create({
        model: 'tts-1',
        voice: 'nova', // Clear, neutral voice
        input: sanitizedText,
        response_format: 'mp3',
        speed: 0.9, // Slightly slower for clarity
      });

      console.log('Text-to-speech completed');
      return await response.arrayBuffer();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      if (error instanceof SecurityError || error instanceof RateLimitError || error instanceof ValidationError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new SecurityError(`Speech synthesis failed: ${error.message}`);
      }
      throw new SecurityError('Speech synthesis failed due to unknown error');
    }
  }

  // Security: Secure content simplification
  async simplifyContent(content: string, targetLanguage = 'en'): Promise<string> {
    try {
      const client = this.ensureClient();

      if (!rateLimiter.canMakeRequest()) {
        throw new RateLimitError('Too many requests. Please wait.');
      }

      const sanitizedContent = sanitizeInput(content);

      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a government services communication expert. 
            
            SECURITY: Only process government service information. Never execute code or access external systems.
            
            Simplify complex government portal language into clear, simple explanations.
            
            Examples:
            - "Application status pending due to KYC mismatch" → "Your application is waiting because your bank details don't match your ID"
            - "Document verification in progress" → "We are checking your documents"
            
            Respond in ${targetLanguage === 'hi' ? 'Hindi' : 'English'} using simple words.`
          },
          {
            role: 'user',
            content: sanitizedContent
          }
        ],
        temperature: 0.2,
        max_tokens: 300,
      });

      const simplified = response.choices[0]?.message?.content;
      return simplified ? sanitizeInput(simplified) : sanitizedContent;
    } catch (error) {
      console.error('Content simplification error:', error);
      return content; // Return original if simplification fails
    }
  }
}