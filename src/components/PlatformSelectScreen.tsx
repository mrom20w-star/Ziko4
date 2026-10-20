import React from 'react';
import { ShieldCheck, Zap, Radio, ChevronRight, CheckCircle2, Award, Flame } from 'lucide-react';
import { PLATFORMS } from '../data/platforms';
import { PlatformConfig, Language } from '../types';
import { sound } from '../utils/sound';
import { ZikoLogo } from './ZikoLogo';

interface PlatformSelectScreenProps {
  selectedPlatform: PlatformConfig;
  onSelectPlatform: (platform: PlatformConfig) => void;
  onProceed: () => void;
  lang: Language;
}

export const PlatformSelectScreen: React.FC<PlatformSelectScreenProps> = ({
  selectedPlatform,
  onSelectPlatform,
  onProceed,
  lang,
}) => {
  return (
    <div className="flex flex-col min-h-full py-6 px-4 sm:px-6 max-w-md mx-auto w-full gap-5">
      {/* Top Banner / Hero */}
      <div className="text-center space-y-2.5">
        <div className="flex justify-center">
          <ZikoLogo size="lg" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold text-[#ff1e38] shadow-[0_0_12px_rgba(255,30,56,0.2)]">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>بوابة هاك زيكو الروسي الرسمية</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          المنصة المعتمدة للهاك
        </h1>

        <p className="text-xs text-zinc-400 font-medium max-w-xs mx-auto leading-relaxed">
          سيرفر BIZBET الرسمي المتزامن مع خوارزميات هاك زيكو الروسي بدقة 99%
        </p>
      </div>

      {/* Platform List */}
      <div className="space-y-3.5">
        {PLATFORMS.map((platform) => {
          const isSelected = selectedPlatform.id === platform.id;
          return (
            <div
              key={platform.id}
              onClick={() => {
                sound.playClick();
                onSelectPlatform(platform);
              }}
              className={`relative rounded-2xl border p-4 transition-all duration-300 cursor-pointer overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-r from-red-950/70 via-black to-zinc-950 border-[#ff1e38] shadow-[0_0_25px_rgba(255,30,56,0.3)] scale-[1.01]'
                  : 'bg-zinc-950/70 border-white/10 hover:border-white/25 hover:bg-zinc-900/60'
              }`}
            >
              {platform.recommended && (
                <div className="absolute top-0 right-0 bg-[#ff1e38] text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl flex items-center gap-1 shadow-md">
                  <Flame className="w-3 h-3" />
                  موصى به VIP
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-black border border-white/15 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                    <img
                      src={platform.img}
                      alt={platform.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white font-cyber tracking-wide">
                        {platform.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#ff1e38] fill-[#ff1e38]/20" />
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 font-medium truncate">
                      {platform.tagline}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="px-2 py-0.5 rounded-lg bg-red-500/15 border border-red-500/30 text-[11px] font-black text-[#ff1e38] font-mono">
                    {platform.accuracy}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 mt-1">
                    {platform.latency}
                  </span>
                </div>
              </div>

              {/* Extra badges */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Zap className="w-3 h-3" />
                  {platform.geo}
                </span>
                <span className="font-mono text-zinc-500">
                  البروموكود المعتمد:{' '}
                  <strong className="text-white font-mono-cyber">R11</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Server specs */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/5 flex items-center justify-center gap-1.5 text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold">
            حماية مشفّرة 100%
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/5 flex items-center justify-center gap-1.5 text-zinc-400">
          <Award className="w-3.5 h-3.5 text-[#ff1e38]" />
          <span className="text-[10px] font-bold">
            سيرفر معتمد فوري
          </span>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => {
          sound.playSuccess();
          onProceed();
        }}
        className="w-full h-13 rounded-2xl bg-gradient-to-r from-red-600 to-[#ff1e38] hover:from-red-500 hover:to-red-600 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-neon-red active:scale-[0.98] transition-all cursor-pointer mt-2"
      >
        <span>
          متابعة الشروط والتفعيل ({selectedPlatform.name})
        </span>
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
      </button>
    </div>
  );
};
