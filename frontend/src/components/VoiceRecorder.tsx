import React, { useState, useRef } from 'react';
import { Mic, Square, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { motion } from 'motion/react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onAnalyze: () => void;
}

export function VoiceRecorder({ onRecordingComplete, onAnalyze }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedAudio(audioBlob);
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone access and try again.');
        } else if (error.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else {
          setError('Error accessing microphone. Please check your device settings.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-8 bg-white/80 backdrop-blur-sm border border-[var(--pastel-blue)]/20 shadow-lg">
      <div className="flex flex-col items-center space-y-6">
        {/* Recording Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full border-4 ${
              isRecording 
                ? 'bg-[var(--pastel-red)] hover:bg-[var(--pastel-red)]/80 border-[var(--pastel-red)]/50' 
                : 'bg-[var(--pastel-blue)] hover:bg-[var(--pastel-blue)]/80 border-[var(--pastel-blue)]/50'
            } transition-all duration-300 shadow-lg`}
          >
            {isRecording ? (
              <Square className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </Button>
        </motion.div>

        {/* Recording Status */}
        <div className="text-center">
          {error ? (
            <div className="space-y-4">
              <div className="bg-[var(--pastel-red)]/10 border border-[var(--pastel-red)]/20 rounded-lg p-4">
                <p className="text-[var(--pastel-red)] text-sm">{error}</p>
              </div>
              <Button
                onClick={() => setError(null)}
                variant="outline"
                className="border-[var(--pastel-blue)] text-[var(--pastel-blue)] hover:bg-[var(--pastel-blue)]/10"
              >
                Try Again
              </Button>
            </div>
          ) : isRecording ? (
            <div className="space-y-2">
              <p className="text-[var(--neutral-text)] font-medium">Recording...</p>
              <p className="text-[var(--pastel-blue)] font-mono text-lg">{formatTime(recordingTime)}</p>
              <div className="flex space-x-1 justify-center">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-8 bg-[var(--pastel-blue)] rounded-full wave-animation"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          ) : recordedAudio ? (
            <div className="space-y-4">
              <p className="text-[var(--neutral-text)] font-medium">Recording complete!</p>
              <Button
                onClick={onAnalyze}
                className="bg-[var(--pastel-green)] hover:bg-[var(--pastel-green)]/80 text-[var(--neutral-text)] px-8 py-3 rounded-full"
              >
                <Play className="w-4 h-4 mr-2" />
                Analyze Voice
              </Button>
            </div>
          ) : (
            <p className="text-[var(--neutral-text)]/70">Click to start recording</p>
          )}
        </div>
      </div>
    </Card>
  );
}