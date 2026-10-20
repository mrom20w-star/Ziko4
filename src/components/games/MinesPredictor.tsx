import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Gem,
  Bomb,
  Sparkles,
  Zap,
  ShieldCheck,
  RotateCcw,
  Activity,
  Layers,
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { Language, PlatformConfig } from '../../types';
import { ZikoLogo } from '../ZikoLogo';

interface MinesPredictorProps {
  platform: PlatformConfig;
  userId: string;
  onBack: () => void;
  lang: Language;
}

export const MinesPredictor: React.FC<MinesPredictorProps> = ({
  platform,
  userId,
  onBack,
  lang,
}) => {
  const [mineCount, setMineCount] = useState<number>(3);
  const [revealedDiamonds, setRevealedDiamonds] = useState<number[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(3480);
  const [signalCount, setSignalCount] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setOnlineUsers((p) => p + (Math.floor(Math.random() * 9) - 4));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleGenerateSignal = () => {
    if (isScanning) return;
    setIsScanning(true);
    setRevealedDiamonds([]);
    sound.playScan();

    let ticks = 0;
    const ticker = setInterval(() => {
      ticks++;
      sound.playRadarTick();
      if (ticks >= 6) {
        clearInterval(ticker);
      }
    }, 180);

    setTimeout(() => {
      clearInterval(ticker);
      // Select 3 to 5 random safe diamond spots
      const count = mineCount === 1 ? 5 : mineCount === 3 ? 4 : mineCount === 5 ? 3 : 2;
      const spots: number[] = [];
      while (spots.length < count) {
        const rand = Math.floor(Math.random() * 25);
        if (!spots.includes(rand)) {
          spots.push(rand);
        }
      }
      setRevealedDiamonds(spots);
      setIsScanning(false);
      setSignalCount((c) => c + 1);
      sound.playSuccess();
    }, 1200);
  };

  const handleReset = () => {
    sound.playClick();
    setRevealedDiamonds([]);
  };

  return (
    <div className="flex flex-col min-h-full py-6 px-4 sm:px-6 max-w-md mx-auto w-full gap-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:border-[#ff1e38]/50 transition-all active:scale-95 cursor-pointer"
          title={lang === 'ar' ? 'رجوع' : 'Back'}
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>

        <div className="flex items-center gap-2">
          <ZikoLogo size="sm" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full shadow-[0_0_12px_rgba(255,30,56,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#ff1e38] animate-pulse" />
            <span className="text-[11px] font-black tracking-wider uppercase text-[#ff1e38] font-cyber">
              هاك زيكو الروسي VIP
            </span>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="p-3.5 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600/30 to-black border border-red-500/40 flex items-center justify-center shadow-neon-red">
            <Gem className="w-5 h-5 text-[#ff1e38]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-white tracking-wide font-cyber">GAMS MINES</h1>
              <span className="text-[9px] font-black uppercase text-[#ff1e38] bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/30">
                VIP
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {lang === 'ar' ? 'كاشف الألماس الآمن' : 'Safe Diamond Detector'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-mono font-bold">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>99%</span>
        </div>
      </div>

      {/* Mine Count Selector */}
      <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-3 backdrop-blur-md space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-300 font-bold flex items-center gap-1.5">
            <Bomb className="w-3.5 h-3.5 text-[#ff1e38]" />
            {lang === 'ar' ? 'عدد القنابل باللعبة:' : 'Mines in Game:'}
          </span>
          <span className="font-mono-cyber font-black text-[#ff1e38] text-xs">
            {mineCount} {lang === 'ar' ? 'قنابل' : 'mines'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[1, 3, 5, 7].map((num) => (
            <button
              key={num}
              onClick={() => {
                sound.playClick();
                setMineCount(num);
                setRevealedDiamonds([]);
              }}
              className={`py-2 rounded-xl text-xs font-black font-mono transition-all cursor-pointer ${
                mineCount === num
                  ? 'bg-[#ff1e38] text-white shadow-neon-red scale-102 border border-red-400'
                  : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              {num} {lang === 'ar' ? 'لغم' : '💣'}
            </button>
          ))}
        </div>
      </div>

      {/* 5x5 Mines Matrix Grid */}
      <div className="relative bg-zinc-950/90 backdrop-blur-2xl border-2 border-[#ff1e38]/30 rounded-[32px] p-4 sm:p-5 flex flex-col items-center justify-center shadow-[0_0_35px_rgba(255,30,56,0.2)]">
        <div className="grid grid-cols-5 gap-2.5 sm:gap-3 w-full max-w-[320px]">
          {Array.from({ length: 25 }).map((_, idx) => {
            const isDiamond = revealedDiamonds.includes(idx);

            return (
              <div
                key={idx}
                className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-500 border relative overflow-hidden select-none ${
                  isDiamond
                    ? 'bg-gradient-to-br from-cyan-950/90 via-black to-blue-950 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.7)] scale-105'
                    : 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-white/10'
                }`}
              >
                {isDiamond ? (
                  <div className="flex flex-col items-center justify-center animate-bounce">
                    <span className="text-2xl drop-shadow-[0_0_12px_rgba(0,240,255,0.9)]">
                      💎
                    </span>
                  </div>
                ) : isScanning ? (
                  <div
                    className="w-3 h-3 rounded-full bg-[#ff1e38]/40 animate-ping"
                    style={{ animationDelay: `${(idx % 5) * 80}ms` }}
                  />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                )}
              </div>
            );
          })}
        </div>

        {/* Status bar */}
        <div className="mt-4 text-center">
          {isScanning ? (
            <div className="flex items-center gap-2 text-xs font-bold text-[#ff1e38]">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{lang === 'ar' ? 'جارٍ كشف الألماس الصافي...' : 'Detecting diamonds...'}</span>
            </div>
          ) : revealedDiamonds.length > 0 ? (
            <div className="flex items-center gap-1.5 text-xs font-black text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {lang === 'ar'
                  ? `تم كشف ${revealedDiamonds.length} خانات ألماس مؤكدة!`
                  : `${revealedDiamonds.length} Verified safe diamond spots!`}
              </span>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 font-medium">
              {lang === 'ar' ? 'انقر أدناه لتوليد إشارة الألماس المباشرة' : 'Click below to generate diamond signal'}
            </p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <button
          onClick={handleGenerateSignal}
          disabled={isScanning}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-red-600 to-[#ff1e38] hover:from-red-500 hover:to-red-600 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-neon-red active:scale-[0.98] transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {isScanning
              ? lang === 'ar'
                ? 'جارٍ مسح مصفوفة الألغام...'
                : 'Scanning Grid...'
              : lang === 'ar'
              ? 'توليد إشارة جديدة'
              : 'Generate New Signal'}
          </span>
        </button>

        {revealedDiamonds.length > 0 && (
          <button
            onClick={handleReset}
            className="w-full h-11 rounded-2xl bg-zinc-900 border border-white/10 hover:border-white/25 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تصفير الإشارة' : 'Reset Grid'}</span>
          </button>
        )}
      </div>

      {/* Live Server Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-zinc-950/80 border border-white/10 rounded-2xl flex items-center gap-2.5 backdrop-blur-md">
          <Zap className="w-4 h-4 text-[#ff1e38]" />
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'المتصلين الآن' : 'Active Online'}
            </span>
            <span className="text-xs font-black font-mono-cyber text-white">
              {onlineUsers.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-3 bg-zinc-950/80 border border-white/10 rounded-2xl flex items-center gap-2.5 backdrop-blur-md">
          <Layers className="w-4 h-4 text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'رقم الإشارة' : 'Signal #'}
            </span>
            <span className="text-xs font-black font-mono-cyber text-cyan-400">
              #{signalCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
