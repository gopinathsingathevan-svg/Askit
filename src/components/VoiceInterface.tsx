import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, AlertTriangle, Loader2 } from 'lucide-react';
import { OpenAIService } from '../services/openai';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { SecurityError, RateLimitError, ValidationError } from '../utils/errors';

interface VoiceInterfaceProps {
  onTranscription: (text: string, analysis: any) => void;
  className?: string;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onTranscription, className = '' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  
  const openAIService = useRef(new OpenAIService());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    error: recordingError,
    clearError: clearRecordingError,
  } = useAudioRecording();

  // Security: Clear errors after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Security: Process audio with comprehensive error handling
  const processAudio = useCallback(async (blob: Blob) => {
    try {
      setIsProcessing(true);
      setError(null);

      console.log('Processing audio blob, size:', blob.size, 'type:', blob.type);
      
      // Convert blob to File for OpenAI API
      const audioFile = new File([blob], 'recording.webm', { type: blob.type });
      
      console.log('Created audio file:', audioFile.name, audioFile.size, audioFile.type);

      // Step 1: Speech to Text
      console.log('Starting speech-to-text...');
      const transcript = await openAIService.current.speechToText(audioFile);
      console.log('Speech-to-text completed:', transcript);
      
      if (!transcript.trim()) {
        throw new ValidationError('No speech detected. Please try speaking clearly.');
      }

      // Step 2: Natural Language Understanding
      console.log('Starting natural language understanding...');
      const analysis = await openAIService.current.processNaturalLanguage(transcript);
      console.log('NLU completed:', analysis);
      
      // Update detected language
      setCurrentLanguage(analysis.language || 'en');

      // Step 3: Callback with results
      console.log('Calling onTranscription callback...');
      onTranscription(transcript, analysis);

      // Step 4: Generate voice response if available
      if (analysis.response) {
        console.log('Playing voice response...');
        await playVoiceResponse(analysis.response);
      }

    } catch (err) {
      console.error('Audio processing error:', err);
      
      let errorMessage = 'Voice processing failed. Please try again.';
      
      if (err instanceof SecurityError) {
        errorMessage = err.message;
      } else if (err instanceof RateLimitError) {
        errorMessage = err.message;
      } else if (err instanceof ValidationError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = `Processing failed: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [onTranscription]);

  // Security: Secure voice response playback
  const playVoiceResponse = useCallback(async (text: string) => {
    try {
      setIsPlaying(true);
      console.log('Generating voice response for:', text);
      
      const audioBuffer = await openAIService.current.textToSpeech(text, currentLanguage);
      console.log('Voice response generated, buffer size:', audioBuffer.byteLength);
      
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        console.log('Voice playback ended');
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl); // Security: Clean up object URL
      };
      audioRef.current.onerror = () => {
        console.error('Voice playback error');
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        setError('Voice playback failed');
      };
      
      console.log('Starting voice playback...');
      await audioRef.current.play();
      
    } catch (err) {
      console.error('Voice response error:', err);
      setIsPlaying(false);
      if (err instanceof Error) {
        setError(`Voice response failed: ${err.message}`);
      } else {
        setError('Voice response failed');
      }
    }
  }, [currentLanguage]);

  // Process audio when recording completes
  useEffect(() => {
    if (audioBlob && !isRecording) {
      console.log('Audio blob available, processing...');
      processAudio(audioBlob);
    }
  }, [audioBlob, isRecording, processAudio]);

  const handleMicClick = useCallback(() => {
    if (isRecording) {
      console.log('Stopping recording via button click');
      stopRecording();
    } else {
      console.log('Starting recording via button click');
      clearRecordingError();
      setError(null);
      startRecording();
    }
  }, [isRecording, stopRecording, startRecording, clearRecordingError]);

  const stopVoicePlayback = useCallback(() => {
    if (audioRef.current) {
      console.log('Stopping voice playback');
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const displayError = error || recordingError;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Microphone Button */}
      <button
        onClick={handleMicClick}
        disabled={isProcessing}
        className={`px-4 py-2 border-2 border-black font-medium text-base cursor-pointer transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
          isRecording 
            ? 'bg-red-100 border-red-500 text-red-700 animate-pulse' 
            : isProcessing 
            ? 'bg-blue-100 border-blue-500 text-blue-700'
            : 'bg-white'
        }`}
        title={
          isRecording 
            ? "Recording... Click to stop" 
            : isProcessing 
            ? "Processing audio..." 
            : "Click to start voice input"
        }
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </button>

      {/* Voice Playback Control */}
      {isPlaying && (
        <button
          onClick={stopVoicePlayback}
          className="px-3 py-2 border-2 border-green-500 bg-green-100 text-green-700 font-medium text-base cursor-pointer transition-all hover:bg-green-200"
          title="Stop voice response"
        >
          <VolumeX className="h-5 w-5" />
        </button>
      )}

      {/* Language Indicator */}
      {currentLanguage !== 'en' && (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded border">
          {currentLanguage.toUpperCase()}
        </span>
      )}

      {/* Error Display */}
      {displayError && (
        <div className="flex items-center space-x-1 text-red-600 text-sm max-w-xs">
          <AlertTriangle className="h-4 w-4" />
          <span className="truncate" title={displayError}>{displayError}</span>
        </div>
      )}

      {/* Status Indicators */}
      {isRecording && (
        <div className="flex items-center space-x-1 text-red-600 text-sm animate-pulse">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          <span>Recording...</span>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center space-x-1 text-blue-600 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </div>
      )}

      {isPlaying && (
        <div className="flex items-center space-x-1 text-green-600 text-sm">
          <Volume2 className="w-4 h-4" />
          <span>Speaking...</span>
        </div>
      )}

      {/* Hidden audio element for cleanup */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default VoiceInterface;