import React from 'react';
import { Send, Timer } from 'lucide-react';
import { ZikoLogo } from './ZikoLogo';
import { sound } from '../utils/sound';

interface HeaderProps {
  onlineCount: number;
  latency: string;
  activeCodeRemainingSeconds?: number | null;
  telegramUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onlineCount,
  latency,
  activeCodeRemainingSeconds,
  telegramUrl = 'https://t.me/+4fSJ8LxoeN1mZGNk',
}) => {
  // Format remaining time nicely
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) {
      return `${hours}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${mins}:${String(s).padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#06070a]/90 border-b border-white/10 px-3.5 sm:px-6 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand: هاك زيكو الروسي */}
        <div className="flex items-center gap-2.5">
          <ZikoLogo size="sm" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-cyber font-black tracking-wider text-base sm:text-lg text-white">
                هاك زيكو <span className="text-[#ff1e38] text-glow-red">الروسي</span>
              </span>
              <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded bg-[#ff1e38]/15 border border-[#ff1e38]/40 text-[#ff1e38]">
                VIP
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono-cyber font-bold text-emerald-400">{latency}</span>
              <span>•</span>
              <span className="font-mono-cyber text-zinc-300 font-semibold">
                {onlineCount.toLocaleString()} متصل
              </span>
            </div>
          </div>
        </div>

        {/* Center Timer Badge if Active Code */}
        {activeCodeRemainingSeconds != null && activeCodeRemainingSeconds > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-red-950/70 to-black border border-[#ff1e38]/40 shadow-neon-red">
            <Timer className="w-3.5 h-3.5 text-[#ff1e38] animate-pulse" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-[8px] text-zinc-400 font-bold uppercase">
                المتبقي
              </span>
              <span className="text-xs font-mono-cyber font-black text-white text-glow-red">
                {formatTime(activeCodeRemainingSeconds)}
              </span>
            </div>
          </div>
        )}

        {/* Action Controls: ONLY TELEGRAM! All other buttons removed as requested */}
        <div className="flex items-center">
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="h-9 px-3 sm:px-4 rounded-xl bg-[#229ED9] hover:bg-[#1f91c7] text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(34,158,217,0.4)] transition-all active:scale-95 cursor-pointer"
            title="قناة التليجرام الرسمية"
          >
            <Send className="w-4 h-4" />
            <span className="hidden xs:inline">قناة التليجرام</span>
          </a>
        </div>
      </div>
    </header>
  );
};
