import React, { useState } from 'react';
import { Mic, Upload, Waves, Shield, Zap, Brain, Home, BarChart3, Info, LogIn } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { VoiceRecorder } from './components/VoiceRecorder';
import { FileUpload } from './components/FileUpload';
import { EnhancedDetectionResult } from './components/EnhancedDetectionResult';
import { HistoryPanel } from './components/HistoryPanel';
import { LoginModal } from './components/LoginModal';
import { UserProfile } from './components/UserProfile';
import { motion } from 'motion/react';

type AnalysisMode = 'record' | 'upload' | null;
type AnalysisState = 'idle' | 'analyzing' | 'complete';
type AppTab = 'home' | 'analyze' | 'history';

interface UserData {
  email: string;
  name: string;
  picture?: string;
}

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

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [history, setHistory] = useState<AnalysisData[]>([
    // Sample history data
    {
      id: '1',
      filename: 'voice_001.wav',
      source: 'upload',
      duration: 2.3,
      format: '.WAV',
      isReal: true,
      confidence: 93.7,
      timestamp: new Date('2025-08-07T13:22:00')
    },
    {
      id: '2',
      filename: 'voice_live02',
      source: 'record',
      duration: 3.1,
      format: '.WAV',
      isReal: false,
      confidence: 89.2,
      timestamp: new Date('2025-08-06T18:05:00')
    }
  ]);

  const generateMockAnalysis = (source: 'upload' | 'record'): AnalysisData => {
    const isReal = Math.random() > 0.5;
    const confidence = Math.floor(Math.random() * 20) + 80; // 80-100%
    const id = Date.now().toString();
    
    return {
      id,
      filename: source === 'upload' ? 'uploaded_audio.wav' : `voice_live_${id}`,
      source,
      duration: Math.round((Math.random() * 5 + 1) * 10) / 10, // 1-6 seconds
      format: '.WAV',
      isReal,
      confidence,
      timestamp: new Date()
    };
  };

  const handleAnalyze = (source: 'upload' | 'record') => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setAnalysisState('analyzing');
    setActiveTab('analyze');
    
    // Simulate analysis
    setTimeout(() => {
      const analysis = generateMockAnalysis(source);
      setCurrentAnalysis(analysis);
      setHistory(prev => [analysis, ...prev]);
      setAnalysisState('complete');
    }, 3000);
  };

  const handleReanalyze = (item?: AnalysisData) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (item) {
      setAnalysisState('analyzing');
      setActiveTab('analyze');
      
      setTimeout(() => {
        const newAnalysis = { ...item, 
          id: Date.now().toString(),
          confidence: Math.floor(Math.random() * 20) + 80,
          timestamp: new Date()
        };
        setCurrentAnalysis(newAnalysis);
        setHistory(prev => [newAnalysis, ...prev]);
        setAnalysisState('complete');
      }, 3000);
    } else {
      resetAnalysis();
    }
  };

  const handleDeleteHistory = (item: AnalysisData) => {
    setHistory(prev => prev.filter(h => h.id !== item.id));
  };

  const handleViewHistoryItem = (item: AnalysisData) => {
    setCurrentAnalysis(item);
    setAnalysisState('complete');
    setActiveTab('analyze');
  };

  const handleLogin = (userData: UserData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('home');
    resetAnalysis();
  };

  const resetAnalysis = () => {
    setAnalysisMode(null);
    setAnalysisState('idle');
    setCurrentAnalysis(null);
    setActiveTab('home');
  };

  const requireAuth = (action: () => void) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    action();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--neutral-bg)] via-white to-[var(--pastel-blue)]/10">
      {/* Header */}
      <header className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="text-center flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--neutral-text)] mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                VOXHANCE
              </h1>
              <p className="text-lg text-[var(--neutral-text-muted)]" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                 Deteksi Deepfake Audio untuk Mitigasi Dampak Voice Catfishing pada Generasi Muda Indonesia
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {user ? (
                <UserProfile 
                  user={user} 
                  onLogout={handleLogout}
                  analysisCount={history.length}
                />
              ) : (
                <Button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-white/90 backdrop-blur-sm text-vox-blue border-2 border-[var(--pastel-blue)]/30 hover:bg-[var(--pastel-blue)] hover:text-white shadow-lg transition-all duration-200"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AppTab)}>
            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mb-8"
            >
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/90 backdrop-blur-sm border-2 border-[var(--pastel-blue)]/30 shadow-lg">
                <TabsTrigger 
                  value="home" 
                  className="flex items-center space-x-2 text-[var(--neutral-text)] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--pastel-blue)] data-[state=active]:to-[var(--pastel-lavender)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analyze"
                  className="flex items-center space-x-2 text-[var(--neutral-text)] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--pastel-blue)] data-[state=active]:to-[var(--pastel-lavender)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                  onClick={() => requireAuth(() => setActiveTab('analyze'))}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analyze</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="history"
                  className="flex items-center space-x-2 text-[var(--neutral-text)] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--pastel-blue)] data-[state=active]:to-[var(--pastel-lavender)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                  onClick={() => requireAuth(() => setActiveTab('history'))}
                >
                  <Info className="w-4 h-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>
            </motion.div>

            {/* Home Tab */}
            <TabsContent value="home" className="space-y-8">
              {/* Welcome Message for Logged-in Users */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8"
                >
                  <Card className="p-6 bg-gradient-to-r from-[var(--pastel-blue)]/20 to-[var(--pastel-green)]/20 border-2 border-[var(--pastel-blue)]/30 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <h3 className="text-xl font-semibold text-[var(--neutral-text)]">
                        Selamat datang, {user.name}! 👋
                      </h3>
                      {user.picture && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-white/60 backdrop-blur-sm rounded-full text-xs">
                          <svg className="w-3 h-3" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          <span className="text-[var(--neutral-text-light)] font-medium">Google</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[var(--neutral-text-muted)]">
                      Siap menganalisis sampel suara? Buka tab Analisis untuk memulai
                    </p>
                  </Card>
                </motion.div>
              )}

              {/* Hero Section */}
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                {/* Left Column - Description */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h2 className="text-2xl md:text-3xl font-semibold text-[var(--neutral-text)]" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      Deteksi Deepfake Audio
                    </h2>
                    <p className="text-lg text-[var(--neutral-text-muted)] leading-relaxed" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                      VOXHANCE membantu generasi muda Indonesia memverifikasi keaslian suara. 
                      Analisis berbasis AI menilai potensi deepfake dan
                      memberi saran mitigasi psikologis agar pengguna tidak mudah tertipu voice catfishing.
                    </p>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[var(--pastel-blue)] rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--neutral-text)]">High Accuracy</p>
                        <p className="text-sm text-[var(--neutral-text-light)]">96%+ detection rate</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[var(--pastel-green)] rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--neutral-text)]">Fast Analysis</p>
                        <p className="text-sm text-[var(--neutral-text-light)]">Results in seconds</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[var(--pastel-lavender)] rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--neutral-text)]">AI-Based Detection</p>
                        <p className="text-sm text-[var(--neutral-text-light)]">Automated deepfake screening </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[var(--pastel-red)] rounded-lg flex items-center justify-center">
                        <Waves className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--neutral-text)]">Real-time</p>
                        <p className="text-sm text-[var(--neutral-text-light)]">Live audio support</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right Column - Illustration */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative"
                >
                  <Card className="p-8 bg-gradient-to-br from-white/95 to-[var(--pastel-blue)]/20 border-2 border-[var(--pastel-blue)]/30 shadow-xl backdrop-blur-sm">
                    <div className="text-center space-y-6">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-r from-[var(--pastel-blue)] to-[var(--pastel-lavender)] rounded-full flex items-center justify-center shadow-lg">
                        <Waves className="w-16 h-16 text-white" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-[var(--neutral-text)]">
                          Perlindungan Voice Catfishing
                        </h3>
                        <p className="text-[var(--neutral-text-muted)]">
                          Cegah peniruan suara dan manipulasi berbasis deepfake
                        </p>
                      </div>
                      {/* Animated waveform */}
                      <div className="flex space-x-1 justify-center">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 bg-gradient-to-t from-[var(--pastel-blue)] to-[var(--pastel-lavender)] rounded-full wave-animation shadow-sm"
                            style={{ 
                              height: `${Math.random() * 40 + 20}px`,
                              animationDelay: `${i * 0.1}s` 
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* Process Steps */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-[var(--pastel-blue)] rounded-full flex items-center justify-center text-white text-xl font-bold">
                      1
                    </div>
                    <h4 className="font-semibold text-[var(--neutral-text)]">Unggah / Rekam</h4>
                    <p className="text-sm text-[var(--neutral-text-muted)]">
                      Pilih sumber audio
                    </p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-[var(--pastel-lavender)] rounded-full flex items-center justify-center text-white text-xl font-bold">
                      2
                    </div>
                    <h4 className="font-semibold text-[var(--neutral-text)]">Analisis Otomatis dengan AI</h4>
                    <p className="text-sm text-[var(--neutral-text-muted)]">
                      Model memeriksa jejak deepfake
                    </p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-[var(--pastel-green)] rounded-full flex items-center justify-center text-white text-xl font-bold">
                      3
                    </div>
                    <h4 className="font-semibold text-[var(--neutral-text)]">Hasil</h4>
                    <p className="text-sm text-[var(--neutral-text-muted)]">
                      Mendapatkan hasil secara instan
                    </p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Analyze Tab */}
            <TabsContent value="analyze" className="space-y-8">
              {!user ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <Card className="p-12 bg-white/90 backdrop-blur-sm border-2 border-[var(--pastel-blue)]/30 shadow-xl">
                    <div className="space-y-6">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[var(--pastel-blue)] to-[var(--pastel-lavender)] rounded-full flex items-center justify-center shadow-lg">
                        <LogIn className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-[var(--neutral-text)]">
                        Authentication Required
                      </h3>
                      <p className="text-[var(--neutral-text-muted)]">
                        Please sign in using the button in the top right to access voice analysis features
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ) : analysisState === 'idle' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-8"
                >
                  <Card className="p-12 bg-white/90 backdrop-blur-sm border-2 border-[var(--pastel-blue)]/30 shadow-xl">
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-[var(--neutral-text)]">
                        Mulai Deteksi Deepfake
                      </h3>
                      <p className="text-[var(--neutral-text-muted)]">
                        
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          onClick={() => setAnalysisMode('record')}
                          size="lg"
                          className="bg-gradient-to-r from-[var(--pastel-blue)] to-[var(--pastel-lavender)] hover:from-[var(--pastel-blue)]/90 hover:to-[var(--pastel-lavender)]/90 text-white px-8 py-4 rounded-full shadow-lg border-2 border-white/20"
                        >
                          <Mic className="w-5 h-5 mr-2" />
                          Rekam Suara
                        </Button>
                        <Button
                          onClick={() => setAnalysisMode('upload')}
                          size="lg"
                          className="bg-white/90 backdrop-blur-sm border-2 border-[var(--pastel-blue)]/50 text-vox-blue hover:bg-[var(--pastel-blue)] hover:text-white px-8 py-4 rounded-full shadow-lg transition-all duration-200"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          Unggah Berkas
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <EnhancedDetectionResult
                  analysisData={currentAnalysis}
                  isAnalyzing={analysisState === 'analyzing'}
                  onReanalyze={() => handleReanalyze()}
                />
              )}

              {analysisState === 'complete' && (
                <div className="text-center">
                  <Button
                    onClick={resetAnalysis}
                    className="bg-white/90 backdrop-blur-sm border-2 border-[var(--pastel-blue)]/50 text-vox-blue hover:bg-[var(--pastel-blue)] hover:text-white shadow-lg transition-all duration-200"
                  >
                    Analisis Lagi
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              {!user ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <Card className="p-12 bg-white/90 backdrop-blur-sm border-2 border-[var(--pastel-blue)]/30 shadow-xl">
                    <div className="space-y-6">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[var(--pastel-blue)] to-[var(--pastel-lavender)] rounded-full flex items-center justify-center shadow-lg">
                        <Info className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-[var(--neutral-text)]">
                        Authentication Required
                      </h3>
                      <p className="text-[var(--neutral-text-muted)]">
                        Please sign in using the button in the top right to view your analysis history
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <HistoryPanel
                  history={history}
                  onReanalyze={handleReanalyze}
                  onDelete={handleDeleteHistory}
                  onViewItem={handleViewHistoryItem}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onLogin={handleLogin}
      />

      {/* Voice Recorder Modal */}
      <Dialog open={analysisMode === 'record'} onOpenChange={() => setAnalysisMode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-[var(--neutral-text)]">
              Rekam Suara Anda
            </DialogTitle>
            <DialogDescription className="text-center text-[var(--neutral-text-muted)]">
              Klik tombol mikrofon untuk mulai merekam
            </DialogDescription>
          </DialogHeader>
          <VoiceRecorder
            onRecordingComplete={() => {}}
            onAnalyze={() => {
              setAnalysisMode(null);
              handleAnalyze('record');
            }}
          />
        </DialogContent>
      </Dialog>

      {/* File Upload Modal */}
      <Dialog open={analysisMode === 'upload'} onOpenChange={() => setAnalysisMode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-[var(--neutral-text)]">
              Unggah Berkas Audio
            </DialogTitle>
            <DialogDescription className="text-center text-[var(--neutral-text-muted)]">
              Silakan pilih metode untuk memberikan sampel audio
            </DialogDescription>
          </DialogHeader>
          <FileUpload
            onFileUpload={() => {}}
            onAnalyze={() => {
              setAnalysisMode(null);
              handleAnalyze('upload');
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}