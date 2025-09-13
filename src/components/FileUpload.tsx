import React, { useCallback, useState } from 'react';
import { Upload, FileAudio, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { motion } from 'motion/react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onAnalyze: () => void;
}

export function FileUpload({ onFileUpload, onAnalyze }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        setUploadedFile(file);
        onFileUpload(file);
      } else {
        alert('Please drop an audio file (.mp3, .wav, .m4a, etc.)');
      }
    }
  }, [onFileUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('audio/')) {
        setUploadedFile(file);
        onFileUpload(file);
      } else {
        alert('Please select an audio file (.mp3, .wav, .m4a, etc.)');
        e.target.value = ''; // Reset the input
      }
    }
  };

  return (
    <Card className="p-8 bg-white/80 backdrop-blur-sm border border-[var(--pastel-blue)]/20 shadow-lg">
      <div className="space-y-6">
        {/* Upload Zone */}
        <motion.div
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            dragActive
              ? 'border-[var(--pastel-blue)] bg-[var(--pastel-blue)]/10'
              : uploadedFile
              ? 'border-[var(--pastel-green)] bg-[var(--pastel-green)]/10'
              : 'border-[var(--pastel-lavender)] hover:border-[var(--pastel-blue)] hover:bg-[var(--pastel-blue)]/5'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          whileHover={{ scale: 1.02 }}
        >
          <div className="space-y-4">
            {uploadedFile ? (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-[var(--pastel-green)] rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="font-medium text-[var(--neutral-text)]">{uploadedFile.name}</p>
                  <p className="text-sm text-[var(--neutral-text)]/70">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors ${
                  dragActive ? 'bg-[var(--pastel-blue)]' : 'bg-[var(--pastel-lavender)]'
                }`}>
                  <FileAudio className={`w-8 h-8 ${dragActive ? 'text-white' : 'text-[var(--neutral-text)]'}`} />
                </div>
                <div>
                  <p className="font-medium text-[var(--neutral-text)]">
                    Drop audio file here
                  </p>
                  <p className="text-sm text-[var(--neutral-text)]/70">
                    or click to browse
                  </p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Upload audio file"
          />
        </motion.div>

        {/* Upload Button */}
        {!uploadedFile && (
          <div className="text-center">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[var(--pastel-blue)] hover:bg-[var(--pastel-blue)]/80 text-white px-8 py-3 rounded-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
        )}

        {/* Analyze Button */}
        {uploadedFile && (
          <div className="text-center">
            <Button
              onClick={onAnalyze}
              className="bg-[var(--pastel-green)] hover:bg-[var(--pastel-green)]/80 text-[var(--neutral-text)] px-8 py-3 rounded-full"
            >
              Analyze Audio
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}