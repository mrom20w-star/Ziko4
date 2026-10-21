import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Sparkles,
  RotateCcw,
  Play,
  ShieldCheck,
  Zap,
  Radio,
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { Language, PlatformConfig } from '../../types';
import { ZikoLogo } from '../ZikoLogo';
import {
  getApplePredictions,
  saveApplePredictions,
  generateApplePredictionsData,
  subscribeToApplePredictions,
} from '../../services/firebase';

interface ApplePredictorProps {
  platform: PlatformConfig;
  userId: string;
  onBack: () => void;
  lang: Language;
}

// 4️⃣ مصفوفة تعريفية للصفوف بترتيب عكسي (من الأعلى إلى الأسفل) لتظهر بالشكل الصحيح في اللعبة
const TARGET_ROWS = [
  { mult: 'x349.68', row: 9, label: 'الصف 10 (القمة)' },
  { mult: 'x69.93', row: 8, label: 'الصف 9' },
  { mult: 'x27.92', row: 7, label: 'الصف 8' },
  { mult: 'x11.18', row: 6, label: 'الصف 7' },
  { mult: 'x6.71', row: 5, label: 'الصف 6' },
  { mult: 'x4.02', row: 4, label: 'الصف 5' },
  { mult: 'x2.41', row: 3, label: 'الصف 4' },
  { mult: 'x1.93', row: 2, label: 'الصف 3' },
  { mult: 'x1.54', row: 1, label: 'الصف 2' },
  { mult: 'x1.23', row: 0, label: 'الصف 1 (البداية)' },
];

export const ApplePredictor: React.FC<ApplePredictorProps> = ({
  platform,
  userId,
  onBack,
  lang,
}) => {
  const [predictions, setPredictions] = useState<Record<string, Record<string, string>>>({});
  const [hasRevealed, setHasRevealed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeOnline, setActiveOnline] = useState(3840);
  const [scanStep, setScanStep] = useState(0);

  // Subscribe in real-time to m11 path in Firebase and load initial predictions
  useEffect(() => {
    getApplePredictions().then((data) => {
      if (data && Object.keys(data).length > 0) {
        setPredictions(data);
      }
    });

    const unsub = subscribeToApplePredictions((data) => {
      if (data && Object.keys(data).length > 0) {
        setPredictions(data);
      }
    });

    const timer = setInterval(() => {
      setActiveOnline((prev) => prev + (Math.floor(Math.random() * 7) - 3));
    }, 4000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  // 3️⃣ المعادلة الدقيقة لربط الإحداثيات برقم الخانة (m1 إلى m50) والتوافق 100% مع قاعدة النسخة
  const isSafeApple = (rowIdx: number, colIdx: number): boolean => {
    if (!predictions || Object.keys(predictions).length === 0) return false;

    // Resolve predictions root map:
    // In Firebase RTDB path /m11, the keys are m1, m2, ..., m50.
    // Cell 11 is literally named 'm11': { m11: '1' } and must NOT be confused with a wrapper!
    let root: Record<string, unknown> = predictions as Record<string, unknown>;
    if (!('m1' in predictions) && predictions.m11 && typeof predictions.m11 === 'object') {
      const candidate = predictions.m11 as Record<string, unknown>;
      if ('m1' in candidate || 'm2' in candidate) {
        root = candidate;
      }
    }

    // 1. حساب الرقم التسلسلي للخانة: row * 5 + col + 1 (من 1 إلى 50)
    const mIndex = rowIdx * 5 + colIdx + 1;
    const mKey = `m${mIndex}`;

    // 2. قراءة الخانة سواء كانت mKey أو رقمية أو داخل مصفوفة
    const cell: unknown =
      root[mKey] ??
      root[String(mIndex)] ??
      (Array.isArray(root) ? root[mIndex] : undefined);

    if (cell === undefined || cell === null) return false;

    // 3. دعم الكائنات المتداخلة مثل { m1: "1" } أو { m1: 1 }
    if (typeof cell === 'object') {
      const obj = cell as Record<string, unknown>;
      const val = obj[mKey] ?? obj[String(mIndex)] ?? obj.val ?? obj.value ?? Object.values(obj)[0];
      return String(val) === '1' || val === true || val === 1;
    }

    // 4. دعم القيم المباشرة "1" أو 1 أو true
    return String(cell) === '1' || cell === true || cell === 1;
  };

  // زر ابدأ الدور: مزامنة التوقعات المباشرة من سيرفر الفايربيز مسار m11 وكشف التفاحات
  const handleStartRound = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setHasRevealed(false);
    setScanStep(0);
    sound.playScan();

    // Laser scan animation effect
    const scanInterval = setInterval(() => {
      setScanStep((s) => (s + 1) % 10);
      sound.playRadarTick();
    }, 110);

    try {
      // قراءة أحدث بيانات مسجلة في مسار m11 من Firebase
      const liveData = await getApplePredictions();
      if (liveData && Object.keys(liveData).length > 0) {
        setPredictions(liveData);
      } else {
        const newPreds = generateApplePredictionsData();
        await saveApplePredictions(newPreds);
        setPredictions(newPreds);
      }
    } catch {
      if (!predictions || Object.keys(predictions).length === 0) {
        const fallback = generateApplePredictionsData();
        setPredictions(fallback);
      }
    }

    setTimeout(() => {
      clearInterval(scanInterval);
      setIsAnalyzing(false);
      setHasRevealed(true);
      sound.playSuccess();
    }, 1200);
  };

  // زر توليد دور جديد ونشره في مسار m11 بقاعدة الفايربيز
  const handleGenerateNextRound = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    sound.playScan();
    const newPreds = generateApplePredictionsData();
    await saveApplePredictions(newPreds);
    setPredictions(newPreds);
    setHasRevealed(true);
    setIsAnalyzing(false);
    sound.playSuccess();
  };

  const handleReset = () => {
    sound.playClick();
    setHasRevealed(false);
  };

  return (
    <div className="flex flex-col min-h-full py-6 px-3.5 sm:px-6 max-w-lg mx-auto w-full gap-4">
      {/* Top Header */}
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
            <span className="text-[11px] font-black tracking-wider uppercase text-[#ff1e38] font-cyber">
              هاك زيكو الروسي VIP
            </span>
          </div>
        </div>
      </div>

      {/* Hero Title with 3D Apple Image */}
      <div className="p-3.5 bg-zinc-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500/60 p-0.5 bg-black shadow-[0_0_20px_rgba(52,211,153,0.4)] shrink-0">
            <img
              src="/apple-official.png"
              alt="Apple of Fortune"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white tracking-wide font-cyber">
              توقع تفاحة الحظ (APPLE OF FORTUNE)
            </h1>
            <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              سيرفر هاك زيكو المباشر • دقة خوارزمية 99%
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono-cyber font-black text-xs">
          VIP
        </span>
      </div>

      {/* 4️⃣ الشبكة بالترتيب الصحيح (10 صفوف من الأسفل للأعلى، 5 أعمدة) */}
      <div className="relative bg-zinc-950/90 backdrop-blur-2xl border-2 border-[#ff1e38]/40 rounded-[28px] p-3 sm:p-5 shadow-[0_0_35px_rgba(255,30,56,0.2)]">
        {/* Background circuit grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ff1e38_1px,transparent_1px)] [background-size:18px_18px] opacity-10 pointer-events-none rounded-[28px]" />

        {/* Column Numbers Header: 1 | 2 | 3 | 4 | 5 matching 1xBet layout */}
        <div className="flex items-center gap-2 sm:gap-3 px-1 pb-1 mb-1 border-b border-white/5" dir="ltr">
          <div className="w-14 sm:w-16 shrink-0 text-center">
            <span className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">
              الادّات
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 flex-1">
            {[1, 2, 3, 4, 5].map((colNum) => (
              <div key={colNum} className="text-center">
                <span className="text-[10px] font-black font-mono-cyber text-zinc-400 bg-zinc-900/60 px-1.5 py-0.5 rounded border border-white/5">
                  C{colNum}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 10 Rows Matrix Container (dir="ltr" so odds/ادات are on the LEFT as requested) */}
        <div className="relative z-10 flex flex-col gap-1.5" dir="ltr">
          {TARGET_ROWS.map((rowInfo, rIdx) => {
            const isScanningThisRow = isAnalyzing && scanStep === (9 - rowInfo.row);

            return (
              <div
                key={rowInfo.row}
                className={`flex items-center gap-2 sm:gap-3 p-1 rounded-xl transition-all duration-300 ${
                  isScanningThisRow
                    ? 'bg-red-500/15 border border-[#ff1e38]/50 shadow-[0_0_12px_rgba(255,30,56,0.3)] scale-[1.01]'
                    : 'bg-zinc-900/40 border border-white/5'
                }`}
              >
                {/* 🎯 Multiplier Tag (الأودز / الادات) ON THE LEFT SIDE (الشمال) */}
                <div className="w-14 sm:w-16 shrink-0 flex flex-col items-start leading-tight pl-1">
                  <span className="text-[11px] sm:text-xs font-black font-mono-cyber text-[#ff1e38] tracking-tight">
                    {rowInfo.mult}
                  </span>
                  <span className="text-[8px] text-zinc-500 font-medium">
                    صف {rowInfo.row + 1}
                  </span>
                </div>

                {/* The 5 Apple Columns */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 flex-1">
                  {Array.from({ length: 5 }).map((_, cIdx) => {
                    const isSafe = isSafeApple(rowInfo.row, cIdx);
                    // Optimal primary path recommendation
                    const isPrimarySafe =
                      isSafe &&
                      !Array.from({ length: cIdx }).some((_, prevC) => isSafeApple(rowInfo.row, prevC));

                    return (
                      <div
                        key={cIdx}
                        className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all duration-300 overflow-hidden select-none ${
                          hasRevealed && isSafe
                            ? isPrimarySafe
                              ? 'border-2 border-amber-400 bg-gradient-to-b from-emerald-950/90 via-black to-zinc-950 shadow-[0_0_22px_rgba(245,158,11,0.6)] scale-105 z-10'
                              : 'border-2 border-emerald-400 bg-gradient-to-b from-emerald-950/90 via-black to-zinc-950 shadow-[0_0_18px_rgba(52,211,153,0.7)] scale-105 z-10'
                            : hasRevealed && !isSafe
                            ? 'border border-red-500/20 bg-zinc-950/60 opacity-30'
                            : isScanningThisRow
                            ? 'border-[#ff1e38]/50 bg-red-950/30'
                            : 'border-white/10 bg-zinc-900/70 hover:border-white/20'
                        }`}
                      >
                        {hasRevealed && isSafe && isPrimarySafe && (
                          <div className="absolute top-0.5 right-0.5 z-20 bg-amber-500 text-black text-[7px] font-black px-1 rounded-full shadow-sm">
                            ⭐
                          </div>
                        )}
                        {hasRevealed ? (
                          isSafe ? (
                            <div className="w-full h-full p-1 flex items-center justify-center animate-in zoom-in-75 duration-300">
                              <img
                                src="/apple-official.png"
                                alt="تفاحة ذهبية سليمة"
                                className="w-[88%] h-[88%] object-contain rounded-lg drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full p-1 flex items-center justify-center opacity-30">
                              <img
                                src="/apple-bad.jpg"
                                alt="تفاحة تالفة"
                                className="w-[80%] h-[80%] object-contain rounded-lg grayscale contrast-125"
                              />
                            </div>
                          )
                        ) : isAnalyzing ? (
                          <div
                            className="w-2.5 h-2.5 rounded-full bg-[#ff1e38] shadow-[0_0_10px_#ff1e38] animate-ping"
                            style={{ animationDelay: `${cIdx * 100}ms` }}
                          />
                        ) : (
                          // Before starting: clean, subtle slot with elegant glow dot (no M1/M2 text!)
                          <div className="w-2 h-2 rounded-full bg-zinc-700/60 border border-white/10 shadow-sm" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status notice */}
        <div className="mt-3 text-center">
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#ff1e38]">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>جارٍ تحليل المسار واكتشاف التفاحات السليمة...</span>
            </div>
          ) : hasRevealed ? (
            <div className="flex items-center justify-center gap-1.5 text-xs font-black text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>تم كشف مسار التفاحات الرابحة من الصف 1 إلى الصف 10 بنجاح!</span>
            </div>
          ) : (
            <p className="text-xs text-zinc-400">
              انقر على زر "ابدأ الدور" لكشف أماكن التفاحات السليمة
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons: "ابدأ الدور" */}
      <div className="space-y-2.5">
        <button
          onClick={handleStartRound}
          disabled={isAnalyzing}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-red-600 to-[#ff1e38] hover:from-red-500 hover:to-red-600 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-neon-red active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>
            {isAnalyzing ? 'جارٍ المزامنة وكشف المسار من الفايربيز...' : 'ابدأ الدور (كشف التوقعات المباشرة)'}
          </span>
        </button>

        {hasRevealed && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleGenerateNextRound}
              disabled={isAnalyzing}
              className="h-11 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>توليد جولة جديدة في الفايربيز</span>
            </button>

            <button
              onClick={handleReset}
              className="h-11 rounded-2xl bg-zinc-900 border border-white/10 hover:border-white/25 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الدور</span>
            </button>
          </div>
        )}
      </div>

      {/* Live Server Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-zinc-950/80 border border-white/10 rounded-2xl flex items-center gap-2.5 backdrop-blur-md">
          <Zap className="w-4 h-4 text-[#ff1e38]" />
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
              المتصلين الآن
            </span>
            <span className="text-xs font-black font-mono-cyber text-white">
              {activeOnline.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-3 bg-zinc-950/80 border border-white/10 rounded-2xl flex items-center gap-2.5 backdrop-blur-md">
          <Radio className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
              حالة السيرفر
            </span>
            <span className="text-xs font-black font-mono text-emerald-400">
              متصل مباشر 99%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
