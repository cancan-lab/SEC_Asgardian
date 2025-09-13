import React from 'react';
import { Card } from './ui/card';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export function ColorShowcase() {
  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border border-[var(--pastel-blue)]/20">
      <h3 className="text-lg font-semibold text-[var(--neutral-text)] mb-6">Enhanced Color Visibility</h3>
      
      <div className="space-y-6">
        {/* Standard Colors */}
        <div>
          <h4 className="text-sm font-medium text-[var(--neutral-text)]/70 mb-3">Standard Colors</h4>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-vox-green" />
              <span className="text-vox-green">Real Voice Detected</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-vox-red" />
              <span className="text-vox-red">Fake Voice Detected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-vox-blue" />
              <span className="text-vox-blue">Additional Information</span>
            </div>
          </div>
        </div>

        {/* Dark Variants */}
        <div>
          <h4 className="text-sm font-medium text-[var(--neutral-text)]/70 mb-3">Dark Variants (Enhanced Visibility)</h4>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-vox-green-dark" />
              <span className="text-vox-green-dark">High Confidence Real</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-vox-red-dark" />
              <span className="text-vox-red-dark">High Confidence Fake</span>
            </div>
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-vox-blue-dark" />
              <span className="text-vox-blue-dark">Important Alert</span>
            </div>
          </div>
        </div>

        {/* Soft Variants */}
        <div>
          <h4 className="text-sm font-medium text-[var(--neutral-text)]/70 mb-3">Soft Variants (Subtle)</h4>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-vox-green-soft" />
              <span className="text-vox-green-soft">Low Confidence Real</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-vox-red-soft" />
              <span className="text-vox-red-soft">Low Confidence Fake</span>
            </div>
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-vox-blue-soft" />
              <span className="text-vox-blue-soft">Neutral Information</span>
            </div>
          </div>
        </div>

        {/* Contrast Variants */}
        <div>
          <h4 className="text-sm font-medium text-[var(--neutral-text)]/70 mb-3">Contrast Variants (Maximum Visibility)</h4>
          <div className="flex items-center space-x-4">
            <span className="text-vox-green-contrast">REAL VOICE</span>
            <span className="text-vox-red-contrast">FAKE VOICE</span>
            <span className="text-vox-blue-contrast">PROCESSING</span>
          </div>
        </div>

        {/* Usage Note */}
        <div className="mt-6 p-4 bg-[var(--pastel-lavender)]/20 rounded-lg border border-[var(--pastel-lavender)]/30">
          <p className="text-sm text-[var(--neutral-text)]/70">
            <strong>Design Note:</strong> Colors are optimized to be soft and calming while maintaining excellent readability. 
            Use standard variants for most cases, dark variants for emphasis, soft variants for secondary information, 
            and contrast variants for critical status indicators.
          </p>
        </div>
      </div>
    </Card>
  );
}