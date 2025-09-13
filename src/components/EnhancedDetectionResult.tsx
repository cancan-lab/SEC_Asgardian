import React from 'react';
import { Shield, AlertTriangle, Brain, Clock, FileAudio, Eye, RotateCcw } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { motion } from 'motion/react';

interface AnalysisData {
  id: string;
  filename: string;
  source: 'upload' | 'record';
  duration: number;
  format: string;
  isReal: boolean;
  confidence: number;
  timestamp: Date;
}

interface EnhancedDetectionResultProps {
  analysisData: AnalysisData | null;
  isAnalyzing: boolean;
  onViewDetails?: () => void;
  onReanalyze?: () => void;
}

const CircularProgress = ({ value, size = 120, strokeWidth = 8, isReal }: { 
  value: number; 
  size?: number; 
  strokeWidth?: number; 
  isReal: boolean;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isReal ? 'var(--pastel-green)' : 'var(--pastel-red)'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--neutral-text)]">{value}%</div>
          <div className="text-xs text-[var(--neutral-text)]/70">Confidence</div>
        </div>
      </div>
    </div>
  );
};

const SpectrogramPreview = ({ filename }: { filename: string }) => {
  // Mock spectrogram data - in real app, this would be actual spectrogram data
  const bars = Array.from({ length: 60 }, () => Math.random() * 100);
  
  return (
    <div className="bg-gradient-to-r from-[var(--pastel-blue)]/20 to-[var(--pastel-lavender)]/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-[var(--neutral-text)]">Spectrogram Preview</h4>
        <Button variant="ghost" size="sm" className="text-vox-blue hover:bg-[var(--pastel-blue)]/10">
          <Eye className="w-4 h-4 mr-1" />
          View Full
        </Button>
      </div>
      <div className="flex items-end space-x-1 h-16">
        {bars.map((height, i) => (
          <div
            key={i}
            className="bg-gradient-to-t from-[var(--pastel-blue)] to-[var(--pastel-lavender)] rounded-sm flex-1 min-w-[1px]"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <p className="text-xs text-[var(--neutral-text)]/60 mt-2">{filename}</p>
    </div>
  );
};

export function EnhancedDetectionResult({ 
  analysisData, 
  isAnalyzing, 
  onViewDetails, 
  onReanalyze 
}: EnhancedDetectionResultProps) {
  if (isAnalyzing) {
    return (
      <Card className="p-8 bg-white/80 backdrop-blur-sm border border-[var(--pastel-blue)]/20 shadow-lg">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-[var(--pastel-blue)] to-[var(--pastel-lavender)] rounded-full flex items-center justify-center pulse-soft">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[var(--neutral-text)] mb-2">
              Menganalisis dengan AI...
            </h3>
            <p className="text-[var(--neutral-text)]/70">
              Sistem kami sedang memproses suara 
            </p>
          </div>
          <div className="w-full max-w-xs mx-auto">
            <Progress value={66} className="h-2" />
          </div>
        </div>
      </Card>
    );
  }

  if (!analysisData) return null;

  const { filename, source, duration, format, isReal, confidence, timestamp } = analysisData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Main Result Card */}
      <Card className={`p-8 bg-white/80 backdrop-blur-sm border shadow-lg ${
        isReal 
          ? 'border-[var(--pastel-green)]/30 bg-gradient-to-br from-white to-[var(--pastel-green)]/5'
          : 'border-[var(--pastel-red)]/30 bg-gradient-to-br from-white to-[var(--pastel-red)]/5'
      }`}>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Status and Confidence */}
          <div className="text-center space-y-6">
            {/* Status Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            >
              <Badge 
                className={`text-lg px-6 py-3 font-bold shadow-lg ${
                  isReal 
                    ? 'bg-[var(--pastel-green)] text-white hover:bg-[var(--pastel-green)]/80'
                    : 'bg-[var(--pastel-red)] text-white hover:bg-[var(--pastel-red)]/80'
                }`}
              >
                {isReal ? '✅ Detected: REAL' : '⚠️ Detected: FAKE'}
              </Badge>
            </motion.div>

            {/* Circular Progress */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
              className="flex justify-center"
            >
              <CircularProgress value={confidence} isReal={isReal} />
            </motion.div>

            <p className="text-[var(--neutral-text)]/70">
              {isReal 
                ? 'This voice appears to be authentic'
                : 'This voice appears to be artificially generated'
              }
            </p>
          </div>

          {/* Right: File Details */}
          <div className="space-y-6">
            {/* File Info Summary */}
            <div className="bg-[#FDFDFD] rounded-lg p-6 border border-[var(--border)]">
              <h4 className="font-semibold text-[var(--neutral-text)] mb-4">Analysis Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--neutral-text)]/70">Filename:</span>
                  <span className="font-medium text-[var(--neutral-text)]">{filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--neutral-text)]/70">Source:</span>
                  <span className="font-medium text-[var(--neutral-text)]">
                    {source === 'upload' ? 'Uploaded File' : 'Live Record'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--neutral-text)]/70">Duration:</span>
                  <span className="font-medium text-[var(--neutral-text)]">{duration}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--neutral-text)]/70">Format:</span>
                  <span className="font-medium text-[var(--neutral-text)]">{format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--neutral-text)]/70">Status:</span>
                  <span className={`${isReal ? 'text-vox-green-contrast' : 'text-vox-red-contrast'}`}>
                    {isReal ? 'REAL' : 'FAKE'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--neutral-text)]/70">Confidence:</span>
                  <span className="font-medium text-[var(--neutral-text)]">{confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--neutral-text)]/70">Timestamp:</span>
                  <span className="font-medium text-[#8D8D8D]">
                    {timestamp.toLocaleDateString('id-ID')} {timestamp.toLocaleTimeString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={onViewDetails}
                variant="outline"
                className="flex-1 border-[var(--pastel-blue)] text-vox-blue hover:bg-[var(--pastel-blue)]/10"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Full Details
              </Button>
              <Button
                onClick={onReanalyze}
                variant="outline"
                className="border-[var(--pastel-lavender)] text-[var(--neutral-text)] hover:bg-[var(--pastel-lavender)]/20"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Spectrogram Preview */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border border-[var(--pastel-blue)]/20">
        <SpectrogramPreview filename={filename} />
      </Card>
    </motion.div>
  );
}