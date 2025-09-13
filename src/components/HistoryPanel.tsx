import React from 'react';
import { Play, RotateCcw, Trash2, Upload, Mic, Calendar, FileAudio } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';

interface HistoryItem {
  id: string;
  filename: string;
  source: 'upload' | 'record';
  timestamp: Date;
  isReal: boolean;
  confidence: number;
  duration: number;
  format: string;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onReplay?: (item: HistoryItem) => void;
  onReanalyze?: (item: HistoryItem) => void;
  onDelete?: (item: HistoryItem) => void;
  onViewItem?: (item: HistoryItem) => void;
}

export function HistoryPanel({ 
  history, 
  onReplay, 
  onReanalyze, 
  onDelete, 
  onViewItem 
}: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <Card className="p-12 bg-white/80 backdrop-blur-sm border border-[var(--pastel-blue)]/20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-[var(--pastel-lavender)] rounded-full flex items-center justify-center">
            <FileAudio className="w-8 h-8 text-[var(--neutral-text)]/50" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--neutral-text)] mb-2">
              No Analysis History
            </h3>
            <p className="text-[var(--neutral-text)]/70">
              Your voice analysis history will appear here
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-[var(--pastel-blue)]/20">
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--neutral-text)]">Analysis History</h3>
            <p className="text-sm text-[var(--neutral-text)]/70">{history.length} total analyses</p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[var(--neutral-text)]/50" />
            <span className="text-sm text-[var(--neutral-text)]/70">Recent first</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#FDFDFD] border-b border-[var(--border)]">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-[var(--neutral-text)]/70">#</th>
              <th className="text-left p-4 text-sm font-medium text-[var(--neutral-text)]/70">File Name</th>
              <th className="text-left p-4 text-sm font-medium text-[var(--neutral-text)]/70">Source</th>
              <th className="text-left p-4 text-sm font-medium text-[var(--neutral-text)]/70">Date & Time</th>
              <th className="text-left p-4 text-sm font-medium text-[var(--neutral-text)]/70">Result</th>
              <th className="text-left p-4 text-sm font-medium text-[var(--neutral-text)]/70">Confidence</th>
              <th className="text-left p-4 text-sm font-medium text-[var(--neutral-text)]/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-[var(--border)] hover:bg-[var(--pastel-blue)]/5 transition-colors cursor-pointer"
                onClick={() => onViewItem?.(item)}
              >
                <td className="p-4">
                  <span className="text-sm text-[var(--neutral-text)]/70">
                    {history.length - index}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      item.isReal ? 'bg-[var(--pastel-green)]/20' : 'bg-[var(--pastel-red)]/20'
                    }`}>
                      <FileAudio className={`w-4 h-4 ${
                        item.isReal ? 'text-vox-green-dark' : 'text-vox-red-dark'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--neutral-text)] text-sm">{item.filename}</p>
                      <p className="text-xs text-[var(--neutral-text)]/60">{item.format} • {item.duration}s</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {item.source === 'upload' ? (
                      <Upload className="w-4 h-4 text-vox-blue" />
                    ) : (
                      <Mic className="w-4 h-4 text-[var(--pastel-lavender)]" />
                    )}
                    <span className="text-sm text-[var(--neutral-text)]">
                      {item.source === 'upload' ? 'Upload' : 'Recording'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    <p className="text-[var(--neutral-text)]">
                      {item.timestamp.toLocaleDateString('id-ID')}
                    </p>
                    <p className="text-[#8D8D8D] text-xs">
                      {item.timestamp.toLocaleTimeString('id-ID')}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <Badge 
                    className={`border font-bold ${
                      item.isReal 
                        ? 'bg-[var(--pastel-green)]/20 text-vox-green-dark border-[var(--pastel-green)]/30'
                        : 'bg-[var(--pastel-red)]/20 text-vox-red-dark border-[var(--pastel-red)]/30'
                    }`}
                  >
                    {item.isReal ? '🟢 Real' : '🔴 Fake'}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          item.isReal ? 'bg-[var(--pastel-green)]' : 'bg-[var(--pastel-red)]'
                        }`}
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-[var(--neutral-text)]">
                      {item.confidence}%
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReplay?.(item);
                      }}
                      className="text-vox-blue hover:bg-[var(--pastel-blue)]/10"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReanalyze?.(item);
                      }}
                      className="text-[var(--pastel-lavender)] hover:bg-[var(--pastel-lavender)]/20"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(item);
                      }}
                      className="text-vox-red hover:bg-[var(--pastel-red)]/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}