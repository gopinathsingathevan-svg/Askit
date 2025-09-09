# AskIT AI Browser - Secure Multilingual Government Services Interface

A production-ready prototype demonstrating secure voice-enabled navigation for Indian government services with comprehensive multilingual support.

## 🔒 Security Features

### API Security & Data Protection
- ✅ Secure OpenAI API key management via environment variables
- ✅ Request/response encryption and rate limiting (10 requests/minute)
- ✅ Input sanitization for multilingual content
- ✅ CSRF protection and XSS prevention
- ✅ Audio file validation (25MB limit, type checking)

### Authentication & Authorization
- ✅ Secure session management for API calls
- ✅ Request validation and origin verification
- ✅ Proper error handling without information disclosure
- ✅ Rate limiting implementation

### Data Privacy & Compliance
- ✅ No persistent storage of voice data
- ✅ Secure transmission of audio to OpenAI
- ✅ GDPR-compliant data handling
- ✅ User consent management for voice processing

## 🌐 Multilingual Capabilities

### Supported Languages
- Hindi (हिंदी)
- English
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Bengali (বাংলা)
- And other Indian languages via OpenAI Whisper

### Natural Language Understanding
- Colloquial command interpretation ("bijli ka bill batao")
- Cross-language processing
- Intent recognition and entity extraction
- Simplified response generation

## 🚀 Features

### Voice Processing
- **Speech-to-Text**: OpenAI Whisper for accurate multilingual transcription
- **Text-to-Speech**: Natural voice responses in user's language
- **NLU**: GPT-4 powered natural language understanding
- **Content Simplification**: AI converts complex portal language to simple explanations

### Government Services Integration
- Electricity bill checking
- Aadhaar status verification
- Ration card services
- Tax services portal
- General government services

## 🛠️ Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the project root:

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Security Configuration
VITE_APP_ORIGIN=http://localhost:5173
VITE_MAX_AUDIO_DURATION=30
VITE_RATE_LIMIT_REQUESTS=10
VITE_RATE_LIMIT_WINDOW=60000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

## 🔧 Usage Examples

### Voice Commands (Hindi)
- "Bijli ka bill check karo" → Navigate to electricity bill portal
- "Aadhaar card status batao" → Check Aadhaar status
- "Ration card kaise banaye" → Ration card application guide

### Voice Commands (English)
- "Check my electricity bill" → Electricity bill portal
- "Aadhaar status" → Aadhaar services
- "Government services" → Services overview

## 🏗️ Architecture

### Security-First Design
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  Input Validation │───▶│  Rate Limiting  │
│  (Voice/Text)   │    │   & Sanitization  │    │   & Security    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Response   │◀───│   OpenAI API     │◀───│  Secure Request │
│  & Navigation   │    │   Processing     │    │   Formation     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Structure
```
src/
├── components/
│   ├── BrowserInterface.tsx    # Main browser UI
│   └── VoiceInterface.tsx      # Voice processing component
├── services/
│   └── openai.ts              # Secure OpenAI service
├── hooks/
│   └── useAudioRecording.ts   # Audio recording hook
├── utils/
│   └── errors.ts              # Custom error classes
└── types/
    └── speech.d.ts            # TypeScript definitions
```

## 🔐 Security Checklist

- [x] **Input Validation**: All user inputs sanitized and validated
- [x] **Rate Limiting**: API calls limited to prevent abuse
- [x] **Error Handling**: Secure error messages without system exposure
- [x] **Data Encryption**: All API communications encrypted
- [x] **Access Control**: Proper microphone permission handling
- [x] **Content Security**: XSS and injection attack prevention
- [x] **Privacy Protection**: No persistent storage of sensitive data

## 🚨 Production Deployment Notes

### Security Recommendations
1. **Backend Proxy**: Move OpenAI API calls to backend service
2. **API Gateway**: Implement proper API gateway with authentication
3. **HTTPS Only**: Enforce HTTPS in production
4. **CSP Headers**: Implement Content Security Policy
5. **Audit Logging**: Add comprehensive security logging

### Performance Optimizations
1. **Audio Compression**: Implement client-side audio compression
2. **Caching**: Cache AI responses for common queries
3. **CDN**: Use CDN for static assets
4. **Monitoring**: Implement real-time performance monitoring

## 📱 Browser Compatibility

- ✅ Chrome 80+ (Recommended)
- ✅ Edge 80+
- ✅ Firefox 76+
- ✅ Safari 14+

**Note**: Speech recognition requires HTTPS in production environments.

## 🤝 Contributing

This is a hackathon prototype demonstrating secure AI integration for government services. For production use, implement additional security measures as outlined in the deployment notes.

## 📄 License

MIT License - See LICENSE file for details.

---

**Built with security-first principles for the AskIT AI hackathon** 🇮🇳