import { useState, useRef, useCallback } from 'react';
import { AudioError, ValidationError } from '../utils/errors';

interface UseAudioRecordingReturn {
  isRecording: boolean;
  audioBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  error: string | null;
  clearError: () => void;
}

export const useAudioRecording = (): UseAudioRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null); // Clear previous recording
      
      // Security: Check for required permissions
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new AudioError('Audio recording not supported in this browser');
      }

      console.log('Requesting microphone access...');
      
      // Security: Request microphone access with constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100, // Higher quality for better recognition
        }
      });

      console.log('Microphone access granted');
      
      // Security: Validate MediaRecorder support
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeType = 'audio/wav';
        } else {
          throw new AudioError('No supported audio recording format found');
        }
      }

      console.log('Using MIME type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Audio data available, size:', event.data.size);
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, creating blob...');
        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log('Created blob, size:', blob.size);
        
        // Security: Validate audio blob
        if (blob.size === 0) {
          setError('No audio data recorded. Please try speaking louder.');
          return;
        }
        
        if (blob.size > 25 * 1024 * 1024) { // 25MB limit
          setError('Audio recording too large. Please try a shorter recording.');
          return;
        }
        
        setAudioBlob(blob);
        
        // Security: Clean up stream
        stream.getTracks().forEach(track => track.stop());
        console.log('Audio recording completed successfully');
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setError(`Recording failed: ${event.error?.message || 'Unknown error'}. Please try again.`);
        setIsRecording(false);
        // Clean up stream on error
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      console.log('Recording started');

      // Security: Auto-stop after maximum duration
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('Auto-stopping recording after 30 seconds');
          stopRecording();
        }
      }, 30000); // 30 second limit

    } catch (err) {
      console.error('Recording start error:', err);
      
      if (err instanceof AudioError || err instanceof ValidationError) {
        setError(err.message);
      } else if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone access and try again.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else {
          setError(`Failed to access microphone: ${err.message}. Please check your settings.`);
        }
      } else {
        setError('Failed to start recording. Please try again.');
      }
      
      setIsRecording(false);
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    console.log('Stopping recording...');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('Recording stop requested');
    }
  }, [isRecording]);

  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    error,
    clearError,
  };
};