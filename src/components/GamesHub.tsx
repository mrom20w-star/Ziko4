import React from 'react';
import { ChevronLeft, Flame, Sparkles, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { GameId, GameItem, PlatformConfig, Language } from '../types';
import { sound } from '../utils/sound';
import { ZikoLogo } from './ZikoLogo';

interface GamesHubProps {
  platform: PlatformConfig;
  userId: string;
  onSelectGame: (gameId: GameId) => void;
  onBack: () => void;
  lang: Language;
}

const GAMES: GameItem[] = [
  {
    id: 'apple',
    title: 'Apple of Fortune',
    subtitle: 'تفاحة الحظ',
    desc: 'توقعات الصفوف الآمنة بدقة خوارزمية 99% ونسب أرباح مضاعفة',
    img: '/apple-good.jpg',
    badge: 'الأكثر ربحاً',
    accuracy: '99%',
    hot: true,
  },
  {
    id: 'crash',
    title: 'Crash Aviator',
    subtitle: 'لعبة الطائرة',
    desc: 'تحليل نقطة انفجار الطائرة المباشرة والضربات المرتفعة',
    img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&auto=format&fit=crop&q=80',
    badge: 'إشارات فورية',
    accuracy: '98%',
    hot: true,
  },
  {
    id: 'mines',
    title: 'Gams Mines',
    subtitle: 'لعبة الألغام والألماس',
    desc: 'كشف خلايا الألماس الصافية بدقة مطلقة مع تجنب القنابل',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    badge: 'تحديث فوري',
    accuracy: '99%',
    hot: false,
  },
];

export const GamesHub: React.FC<GamesHubProps> = ({
  platform,
  userId,
  onSelectGame,
  onBack,
  lang,
}) => {
  return (
    <div className="flex flex-col min-h-full py-6 px-4 sm:px-6 max-w-md mx-auto w-full gap-5">
      {/* Top Bar with Platform and User status */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:border-[#ff1e38]/50 transition-all active:scale-95 cursor-pointer"
          title="رجوع"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>

        <div className="flex items-center gap-2">
          <ZikoLogo size="sm" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full shadow-[0_0_12px_rgba(255,30,56,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#ff1e38] animate-pulse" />
            <span className="text-xs font-black tracking-wider uppercase text-[#ff1e38] font-cyber">
              هاك زيكو الروسي VIP
            </span>
          </div>
        </div>
      </div>

      {/* User ID banner */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/80 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-zinc-300 font-bold">
            معرف الحساب المفعل:
          </span>
          <span className="font-mono-cyber font-black text-white text-xs">{userId}</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          متصل
        </span>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          اختر اللعبة لبدء إشارات الهاك
        </h1>
        <p className="text-xs text-zinc-400 leading-relaxed">
          حدد لعبتك لعرض إشارات خوارزمية هاك زيكو الروسي المباشرة بدقة 99%
        </p>
      </div>

      {/* Games List */}
      <div className="space-y-4">
        {GAMES.map((game) => (
          <div
            key={game.id}
            onClick={() => {
              sound.playSuccess();
              onSelectGame(game.id);
            }}
            className="group relative rounded-2xl border border-white/10 bg-zinc-950/80 hover:border-[#ff1e38] hover:bg-zinc-900/90 p-4 transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(255,30,56,0.3)] active:scale-[0.98]"
          >
            {/* Hot badge */}
            {game.hot && (
              <div className="absolute top-0 right-0 bg-[#ff1e38] text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl flex items-center gap-1 shadow-md">
                <Flame className="w-3 h-3" />
                {game.badge}
              </div>
            )}

            <div className="flex items-start gap-3.5">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0 relative group-hover:border-[#ff1e38]/50 transition-colors">
                <img
                  src={game.img}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white group-hover:text-[#ff1e38] transition-colors">
                    {game.title}
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-bold">
                    ({game.subtitle})
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {game.desc}
                </p>

                {/* Accuracy & Button */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
                  <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff1e38]" />
                    <span>دقة الخوارزمية:</span>
                    <strong className="text-[#ff1e38] font-mono-cyber font-black">
                      {game.accuracy}
                    </strong>
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-white group-hover:text-[#ff1e38] transition-colors">
                    <span>فتح التوقعات</span>
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
