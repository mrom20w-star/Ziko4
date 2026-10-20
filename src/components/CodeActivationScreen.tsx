import React, { useState } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Timer,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { getDeviceId, getDeviceLabel } from '../utils/device';
import { verifyAndActivateCode } from '../services/firebase';
import { AccessCode, Language } from '../types';
import { ZikoLogo } from './ZikoLogo';

interface CodeActivationScreenProps {
  onCodeActivated: (codeData: AccessCode) => void;
  onOpenAdmin?: () => void;
  lang: Language;
}

export const CodeActivationScreen: React.FC<CodeActivationScreenProps> = ({
  onCodeActivated,
  lang,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const deviceId = getDeviceId();
  const deviceLabel = getDeviceLabel();

  const handleActivate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputCode.trim()) {
      setErrorMsg('يرجى إدخال كود التفعيل أولاً');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    sound.playScan();

    try {
      const res = await verifyAndActivateCode(inputCode, deviceId, deviceLabel);
      if (res.success && res.codeData) {
        sound.playSuccess();
        onCodeActivated(res.codeData);
      } else {
        sound.playClick();
        setErrorMsg(res.error || 'فشل تفعيل الكود');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء فحص الكود';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full py-8 px-4 sm:px-6 max-w-md mx-auto w-full gap-5">
      {/* Top Brand Hero */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <ZikoLogo size="lg" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold text-[#ff1e38]">
          <Lock className="w-3.5 h-3.5" />
          <span>هاك زيكو الروسي VIP</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          تفعيل كود الاشتراك
        </h1>

        <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
          أدخل كود الاشتراك لتسجيل الدخول إلى سيرفر هاك زيكو الروسي. كل كود مخصص لجهاز واحد فقط ومحدد بمدة زمنية.
        </p>
      </div>

      {/* Main Activation Box */}
      <div className="rounded-[32px] border-2 border-white/10 bg-zinc-950/85 p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-4">
        <form onSubmit={handleActivate} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              كود التفعيل (VIP Access Code)
            </label>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="SMART-XXXX-XXXX"
              disabled={isLoading}
              className="w-full h-13 bg-zinc-900 border border-white/15 focus:border-[#ff1e38] focus:ring-1 focus:ring-[#ff1e38] rounded-2xl px-4 text-white font-mono-cyber tracking-widest text-base sm:text-lg transition-all outline-none uppercase placeholder:text-zinc-600 text-center"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 flex items-start gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-[#ff1e38] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-13 rounded-2xl bg-gradient-to-r from-red-600 to-[#ff1e38] hover:from-red-500 hover:to-red-600 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-neon-red active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>جارٍ التحقق وتثبيت الجهاز...</span>
              </span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>تفعيل الكود والدخول للهاك</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>

        {/* Device Guarantee Specs */}
        <div className="space-y-2 pt-2 border-t border-white/10 text-[11px] text-zinc-400">
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-white/5">
            <span className="flex items-center gap-1.5 font-bold">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>معرف جهازك الحالي:</span>
            </span>
            <span className="font-mono text-zinc-300 text-[10px]">{deviceId.slice(0, 16)}...</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-white/5">
            <span className="flex items-center gap-1.5 font-bold">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span>نظام الحماية:</span>
            </span>
            <span className="text-emerald-400 font-bold">
              قفل جهاز واحد + خروج تلقائي
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
