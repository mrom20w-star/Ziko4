import React, { useEffect, useState } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { Language } from '../types';

interface LiveWinsTickerProps {
  lang: Language;
}

interface WinRecord {
  id: string;
  user: string;
  game: string;
  amount: string;
  mult: string;
}

const SAMPLE_WINS: WinRecord[] = [
  { id: '1', user: 'ID: 489***21', game: 'Apple of Fortune', amount: '3,850 EGP', mult: 'x10.0' },
  { id: '2', user: 'ID: 912***04', game: 'Crash Aviator', amount: '5,200 EGP', mult: 'x6.45' },
  { id: '3', user: 'ID: 301***77', game: 'Gams Mines', amount: '2,900 EGP', mult: 'x4.20' },
  { id: '4', user: 'ID: 754***82', game: 'Crash Aviator', amount: '$140.00', mult: 'x3.80' },
  { id: '5', user: 'ID: 632***19', game: 'Apple of Fortune', amount: '7,400 EGP', mult: 'x15.0' },
  { id: '6', user: 'ID: 809***43', game: 'Gams Mines', amount: '4,150 EGP', mult: 'x5.12' },
];

export const LiveWinsTicker: React.FC<LiveWinsTickerProps> = ({ lang }) => {
  const [currentWin, setCurrentWin] = useState<WinRecord>(SAMPLE_WINS[0]);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        index = (index + 1) % SAMPLE_WINS.length;
        setCurrentWin(SAMPLE_WINS[index]);
        setFade(true);
      }, 300);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto px-4 mt-2">
      <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-zinc-950/80 border border-emerald-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.1)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
            {lang === 'ar' ? 'فوز اللاعبين مباشر' : 'LIVE WINS'}
          </span>
        </div>

        <div
          className={`flex items-center gap-2 text-xs transition-opacity duration-300 ${
            fade ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="font-mono text-zinc-400 text-[11px]">{currentWin.user}</span>
          <span className="text-zinc-500">•</span>
          <span className="font-mono font-bold text-white text-[11px]">{currentWin.amount}</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-black text-[10px] flex items-center gap-0.5">
            <TrendingUp className="w-2.5 h-2.5" />
            {currentWin.mult}
          </span>
        </div>
      </div>
    </div>
  );
};
