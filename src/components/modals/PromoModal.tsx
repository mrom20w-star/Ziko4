import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, ExternalLink, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/sound';
import { Language, PlatformConfig } from '../../types';
import { ZikoLogo } from '../ZikoLogo';

interface PromoModalProps {
  platform: PlatformConfig;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const PromoModal: React.FC<PromoModalProps> = ({
  platform,
  isOpen,
  onClose,
  lang,
}) => {
  const [copied, setCopied] = useState(false);
  const promoCode = 'R11';

  if (!isOpen) return null;

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(promoCode).catch(() => {});
    setCopied(true);
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-[32px] bg-[#0c0d12] border-2 border-[#ff1e38]/50 p-6 shadow-[0_0_50px_rgba(255,30,56,0.3)] text-center space-y-4">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo & Title */}
        <div className="flex justify-center">
          <ZikoLogo size="md" />
        </div>

        <div>
          <h3 className="text-xl font-black text-white tracking-wide">
            تفعيل كود الخصم المعتمد
          </h3>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
            استخدم هذا الكود عند تسجيل حسابك الجديد لربطه بسيرفر هاك زيكو الروسي بدقة 99%
          </p>
        </div>

        {/* Code Box: R11 */}
        <div
          onClick={handleCopy}
          className="bg-zinc-900/90 rounded-2xl border-2 border-dashed border-[#ff1e38]/60 hover:border-[#ff1e38] p-4 transition-all cursor-pointer group shadow-neon-red flex items-center justify-between"
        >
          <div>
            <span className="block text-[9px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">
              كود التفعيل المعتمد
            </span>
            <span className="text-3xl font-black font-mono-cyber text-[#ff1e38] text-glow-red">
              {promoCode}
            </span>
          </div>

          <div
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              copied
                ? 'bg-[#ff1e38] text-white shadow-neon-red'
                : 'bg-white/10 text-white group-hover:bg-white/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ</span>
              </>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          <a
            href={platform.registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-red-600 to-[#ff1e38] hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-neon-red active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>التسجيل وتفعيل البروموكود</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full h-11 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/25 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>المتابعة إلى التوقعات</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
