import React from 'react';
import { Shield, AlertTriangle, Brain, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';

interface DetectionResultProps {
  isReal: boolean;
  confidence: number;
  isAnalyzing: boolean;
}

export function DetectionResult({ isReal, confidence, isAnalyzing }: DetectionResultProps) {
  if (isAnalyzing) {
    return (
      <Card className="p-8 bg-white/80 backdrop-blur-sm border border-[var(--pastel-blue)]/20 shadow-lg">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-[var(--pastel-blue)] to-[var(--pastel-lavender)] rounded-full flex items-center justify-center pulse-soft">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[var(--neutral-text)] mb-2">
              Analyzing with GAN...
            </h3>
            <p className="text-[var(--neutral-text)]/70">
              Our AI is processing your audio
            </p>
          </div>
          <div className="w-full max-w-xs mx-auto">
            <Progress value={66} className="h-2" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`p-8 bg-white/80 backdrop-blur-sm border shadow-lg ${
        isReal 
          ? 'border-[var(--pastel-green)]/30 bg-gradient-to-br from-white to-[var(--pastel-green)]/5'
          : 'border-[var(--pastel-red)]/30 bg-gradient-to-br from-white to-[var(--pastel-red)]/5'
      }`}>
        <div className="text-center space-y-6">
          {/* Result Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
              isReal ? 'bg-[var(--pastel-green)]' : 'bg-[var(--pastel-red)]'
            }`}
          >
            {isReal ? (
              <Shield className="w-12 h-12 text-white" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-white" />
            )}
          </motion.div>

          {/* Result Text */}
          <div className="space-y-2">
            <Badge 
              className={`text-lg px-6 py-2 font-bold shadow-lg ${
                isReal 
                  ? 'bg-[var(--pastel-green)] text-white hover:bg-[var(--pastel-green)]/80'
                  : 'bg-[var(--pastel-red)] text-white hover:bg-[var(--pastel-red)]/80'
              }`}
            >
              Voice is {isReal ? 'REAL' : 'FAKE'}
            </Badge>
            <p className="text-[var(--neutral-text)]/70">
              {isReal 
                ? 'This voice appears to be authentic'
                : 'This voice appears to be artificially generated'
              }
            </p>
          </div>

          {/* Confidence Score */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--neutral-text)]/70">Confidence</span>
              <span className="font-semibold text-[var(--neutral-text)]">{confidence}%</span>
            </div>
            <Progress 
              value={confidence} 
              className={`h-3 ${
                isReal ? '[&>div]:bg-[var(--pastel-green)]' : '[&>div]:bg-[var(--pastel-red)]'
              }`}
            />
          </div>

          {/* Technical Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-[var(--pastel-lavender)] rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-[var(--neutral-text)]" />
              </div>
              <p className="text-xs text-[var(--neutral-text)]/70">GAN Detection</p>
              <p className="text-sm font-medium text-[var(--neutral-text)]">98.5%</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-[var(--pastel-lavender)] rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-[var(--neutral-text)]" />
              </div>
              <p className="text-xs text-[var(--neutral-text)]/70">Speed</p>
              <p className="text-sm font-medium text-[var(--neutral-text)]">0.8s</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-[var(--pastel-lavender)] rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-[var(--neutral-text)]" />
              </div>
              <p className="text-xs text-[var(--neutral-text)]/70">Accuracy</p>
              <p className="text-sm font-medium text-[var(--neutral-text)]">96.2%</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}