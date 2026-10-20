import React, { useState } from 'react';
import {
  Download,
  Send,
  Copy,
  Check,
  ExternalLink,
  DollarSign,
  Coins,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  Fingerprint,
  Loader2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlatformConfig, Language } from '../types';
import { sound } from '../utils/sound';
import { ZikoLogo } from './ZikoLogo';

interface ActivationFlowProps {
  platform: PlatformConfig;
  onBack: () => void;
  onComplete: (userId: string) => void;
  lang: Language;
}

export const ActivationFlow: React.FC<ActivationFlowProps> = ({
  platform,
  onBack,
  onComplete,
  lang,
}) => {
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const telegramUrl = 'https://t.me/+4fSJ8LxoeN1mZGNk';
  const promoCode = 'R11';

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(promoCode).catch(() => {});
    setCopied(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
    setTimeout(() => setCopied(false), 2500);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setErrorMsg('يرجى إدخال معرف الحساب أولاً');
      return;
    }
    if (userId.trim().length < 5) {
      setErrorMsg('معرف الحساب يجب أن يتكون من 5 أرقام على الأقل');
      return;
    }

    setErrorMsg(null);
    setIsVerifying(true);
    setVerifyStep(1);
    sound.playScan();

    setTimeout(() => {
      setVerifyStep(2);
      sound.playRadarTick();
    }, 1200);

    setTimeout(() => {
      setVerifyStep(3);
      sound.playRadarTick();
    }, 2400);

    setTimeout(() => {
      setIsVerifying(false);
      sound.playSuccess();
      onComplete(userId.trim());
    }, 3600);
  };

  return (
    <div className="flex flex-col min-h-full py-6 px-4 sm:px-6 max-w-md mx-auto w-full gap-5">
      {/* Header with back button */}
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
          <span className="text-xs font-black font-cyber text-white uppercase tracking-wider">
            هاك زيكو الروسي VIP
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center space-y-1.5">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          تفعيل الربط مع سيرفر هاك زيكو
        </h1>
        <p className="text-xs text-zinc-400 leading-relaxed">
          أكمل الشروط لتفعيل الربط المباشر مع سيرفر التوقعات بدقة 99%
        </p>
      </div>

      {/* 5 STEPS CONTAINER */}
      <div className="space-y-4">
        {/* Step 1: Download App */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4.5 backdrop-blur-md shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#ff1e38] text-white flex items-center justify-center font-black text-xs shadow-neon-red">
                1
              </div>
              <h2 className="text-sm font-black text-white">
                تثبيت تطبيق {platform.name}
              </h2>
            </div>
            <span className="text-[10px] font-bold text-[#ff1e38] bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
              إلزامي
            </span>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900/80 border border-white/5 p-3 rounded-xl">
            <div className="w-11 h-11 rounded-xl bg-black border border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden">
              <img src={platform.img} alt={platform.name} className="w-full h-full object-contain" />
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              قم بتحميل وتثبيت النسخة الرسمية من تطبيق {platform.name} لربط معرف حسابك مع خوارزمية هاك زيكو الروسي.
            </p>
          </div>

          <a
            href={platform.appDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-red-600 to-[#ff1e38] hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-neon-red active:scale-[0.98] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تحميل تطبيق {platform.name}</span>
          </a>
        </div>

        {/* Step 2: Join Telegram */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4.5 backdrop-blur-md shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#229ED9] text-white flex items-center justify-center font-black text-xs shadow-[0_0_12px_rgba(34,158,217,0.4)]">
                2
              </div>
              <h2 className="text-sm font-black text-white">
                الانضمام لقناة التلجرام
              </h2>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              تحديثات فورية
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-900/80 border border-white/5 p-3 rounded-xl">
            انضم لقناتنا الرسمية لمتابعة الإشارات المباشرة والتحديثات وسيرفرات التوقعات في الوقت الفعلي.
          </p>

          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="w-full h-11 rounded-xl bg-[#229ED9] hover:bg-[#1f91c7] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,158,217,0.35)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>الانضمام إلى قناة التلجرام الرسمية</span>
            <ExternalLink className="w-3.5 h-3.5 rtl:mr-1 ltr:ml-1" />
          </a>
        </div>

        {/* Step 3: Promo Code R11 */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4.5 backdrop-blur-md shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#ff1e38] text-white flex items-center justify-center font-black text-xs shadow-neon-red">
                3
              </div>
              <h2 className="text-sm font-black text-white">
                إدخال كود البروموكود ({promoCode})
              </h2>
            </div>
            <span className="text-[10px] font-bold text-[#ff1e38] bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/25">
              مطلوب للتسجيل
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            عند إنشاء حسابك الجديد، استخدم البروموكود المعتمد لضمان ربط حسابك بسيرفر هاك زيكو الروسي بنجاح:
          </p>

          <div
            onClick={handleCopyCode}
            className="relative bg-zinc-900/90 rounded-xl border-2 border-dashed border-[#ff1e38]/50 hover:border-[#ff1e38] p-3.5 transition-all cursor-pointer group shadow-neon-red flex items-center justify-between"
          >
            <div>
              <span className="block text-[9px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">
                الكود المعتمد
              </span>
              <span className="text-3xl font-black font-mono-cyber tracking-widest text-[#ff1e38] text-glow-red">
                {promoCode}
              </span>
            </div>

            <button
              type="button"
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                copied
                  ? 'bg-[#ff1e38] text-white shadow-neon-red'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ الكود</span>
                </>
              )}
            </button>
          </div>

          <a
            href={platform.registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="w-full h-11 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#ff1e38]" />
            <span>إنشاء حساب وتفعيل البروموكود</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-600" />
          </a>
        </div>

        {/* Step 4: Minimum Deposit */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4.5 backdrop-blur-md shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#ff1e38] text-white flex items-center justify-center font-black text-xs shadow-neon-red">
                4
              </div>
              <h2 className="text-sm font-black text-white">
                الحد الأدنى للإيداع
              </h2>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              تفعيل الخوارزمية
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            قم بإجراء أول عملية إيداع بالحساب للحد الأدنى الموضح لتفعيل المزامنة التلقائية مع محرك هاك زيكو الروسي:
          </p>

          <div className="grid grid-cols-2 gap-2.5" dir="ltr">
            <div className="bg-zinc-900/90 border border-white/10 p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-[#ff1e38]" /> USD ($)
              </span>
              <span className="text-xl font-black text-white font-mono-cyber">$3.00</span>
            </div>

            <div className="bg-zinc-900/90 border border-white/10 p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Coins className="w-3 h-3 text-[#ff1e38]" /> EGP (جنيه)
              </span>
              <span className="text-xl font-black text-[#ff1e38] font-mono-cyber">150 L.E</span>
            </div>
          </div>
        </div>

        {/* Step 5: ID Verification */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4.5 backdrop-blur-md shadow-lg space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                5
              </div>
              <h2 className="text-sm font-black text-white">
                ربط معرف الحساب (ID)
              </h2>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
              ربط فوري
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            أدخل رقم الـ ID الخاص بحسابك للتأكد من ربطه بخوارزمية هاك زيكو الروسي المباشرة:
          </p>

          <form onSubmit={handleVerify} className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-zinc-500">
                <Fingerprint className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isVerifying}
                placeholder="مثال: 74829105"
                className="w-full h-12 bg-zinc-900 border border-white/15 focus:border-[#ff1e38] focus:ring-1 focus:ring-[#ff1e38] rounded-xl ps-10 pe-4 text-white font-mono-cyber tracking-wider text-sm transition-all outline-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-[#ff1e38] font-bold">{errorMsg}</p>
            )}

            {isVerifying ? (
              <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Loader2 className="w-4 h-4 animate-spin text-[#ff1e38]" />
                  <span className="font-bold">
                    {verifyStep === 1 && 'الاتصال بسيرفر هاك زيكو الروسي...'}
                    {verifyStep === 2 && 'التحقق من كود البروموكود R11...'}
                    {verifyStep === 3 && 'تأكيد مزامنة الخوارزمية 99%...'}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#ff1e38] h-full transition-all duration-700 shadow-neon-red"
                    style={{ width: `${(verifyStep / 3) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ربط الحساب وتفعيل الإشارات</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
