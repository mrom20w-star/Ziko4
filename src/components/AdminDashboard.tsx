import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  KeyRound,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ShieldAlert,
  Smartphone,
  Timer,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';
import { getAllAccessCodes, createAccessCode, deleteAccessCode } from '../services/firebase';
import { AccessCode, Language } from '../types';
import { ZikoLogo } from './ZikoLogo';

interface AdminDashboardProps {
  onBack: () => void;
  lang: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, lang }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [durationHours, setDurationHours] = useState<number>(1);
  const [note, setNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<string | null>(null);

  // Load codes
  const loadCodes = async () => {
    try {
      const data = await getAllAccessCodes();
      setCodes(data);
    } catch (e) {
      console.warn('Error loading codes:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCodes();
      const interval = setInterval(loadCodes, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: admin or 1234
    if (adminPin === 'admin' || adminPin === '1234' || adminPin === 'admin123') {
      sound.playSuccess();
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      sound.playClick();
      setPinError(true);
    }
  };

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    sound.playScan();

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCode = `SMART-${durationHours}H-${randomSuffix}`;

    const newCodeObj: AccessCode = {
      code: newCode,
      durationHours: durationHours,
      createdAt: Date.now(),
      activatedAt: null,
      expiresAt: null,
      boundDeviceId: null,
      status: 'unused',
      note: note.trim() || `اشتراك ${durationHours} ساعة`,
    };

    await createAccessCode(newCodeObj);
    setLastCreated(newCode);
    setNote('');
    setIsGenerating(false);
    sound.playSuccess();

    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {}

    await loadCodes();
  };

  const handleDeleteCode = async (codeStr: string) => {
    if (confirm(lang === 'ar' ? `هل أنت متأكد من حذف الكود ${codeStr}؟` : `Delete code ${codeStr}?`)) {
      sound.playClick();
      await deleteAccessCode(codeStr);
      await loadCodes();
    }
  };

  const handleCopy = (codeStr: string) => {
    sound.playClick();
    navigator.clipboard.writeText(codeStr).catch(() => {});
    setCopiedCode(codeStr);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const now = Date.now();
  const totalCount = codes.length;
  const activeCount = codes.filter(
    (c) => c.status === 'active' && c.expiresAt && now < c.expiresAt
  ).length;
  const unusedCount = codes.filter((c) => c.status === 'unused').length;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-full py-8 px-4 sm:px-6 max-w-md mx-auto w-full gap-5">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>

        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <ZikoLogo size="md" />
          </div>
          <h1 className="text-xl font-black text-white">هاك زيكو الروسي - لوحة تحكم الأدمن</h1>
          <p className="text-xs text-zinc-400">أدخل كلمة مرور المسؤول للوصول لتوليد الأكواد وإدارتها</p>
        </div>

        <form onSubmit={handleLogin} className="p-5 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-3.5 backdrop-blur-xl">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">كلمة المرور / الـ PIN</label>
            <input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="admin أو 1234"
              className="w-full h-12 bg-zinc-900 border border-white/15 focus:border-[#ff1e38] rounded-xl px-4 text-white text-center font-mono outline-none"
            />
          </div>

          {pinError && (
            <p className="text-xs text-[#ff1e38] font-bold text-center">كلمة المرور غير صحيحة (جرب admin أو 1234)</p>
          )}

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-red-600 to-[#ff1e38] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-neon-red cursor-pointer"
          >
            <span>دخول لوحة التحكم</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full py-6 px-4 sm:px-6 max-w-2xl mx-auto w-full gap-5">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/80 border border-white/10 backdrop-blur-md">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>

        <div className="flex items-center gap-2">
          <ZikoLogo size="sm" />
          <h1 className="text-base font-black text-white font-cyber">هاك زيكو الروسي - لوحة الأكواد (ADMIN VIP)</h1>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            loadCodes();
          }}
          className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
          title="تحديث"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/10">
          <span className="text-[10px] text-zinc-400 font-bold block uppercase">إجمالي الأكواد</span>
          <span className="text-xl font-black font-mono-cyber text-white">{totalCount}</span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/10">
          <span className="text-[10px] text-zinc-400 font-bold block uppercase">النشطة حالياً</span>
          <span className="text-xl font-black font-mono-cyber text-emerald-400">{activeCount}</span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/10">
          <span className="text-[10px] text-zinc-400 font-bold block uppercase">جاهزة للاستخدام</span>
          <span className="text-xl font-black font-mono-cyber text-[#ff1e38]">{unusedCount}</span>
        </div>
      </div>

      {/* Generate Box */}
      <div className="p-5 rounded-3xl bg-zinc-950/80 border border-[#ff1e38]/40 shadow-neon-red space-y-3.5">
        <h2 className="text-sm font-black text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#ff1e38]" />
          <span>توليد كود اشتراك جديد (مخصص لجهاز واحد)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold mb-1">المدة الزمنية</label>
            <select
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="w-full h-11 bg-zinc-900 border border-white/15 rounded-xl px-3 text-xs text-white outline-none"
            >
              <option value={1}>ساعة واحدة (1 Hour)</option>
              <option value={2}>ساعتان (2 Hours)</option>
              <option value={6}>6 ساعات (6 Hours)</option>
              <option value={12}>12 ساعة (12 Hours)</option>
              <option value={24}>يوم كامل (24 Hours)</option>
              <option value={72}>3 أيام (72 Hours)</option>
              <option value={168}>أسبوع (7 Days)</option>
              <option value={720}>شهر (30 Days)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-zinc-400 font-bold mb-1">ملاحظة / اسم العميل</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثال: اشتراك لأحمد"
              className="w-full h-11 bg-zinc-900 border border-white/15 rounded-xl px-3 text-xs text-white outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="w-full h-11 bg-gradient-to-r from-red-600 to-[#ff1e38] hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-neon-red flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>توليد الكود</span>
            </button>
          </div>
        </div>

        {lastCreated && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-mono-cyber font-bold text-white tracking-wider">{lastCreated}</span>
            </div>
            <button
              onClick={() => handleCopy(lastCreated)}
              className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-bold text-[11px] hover:bg-emerald-400 cursor-pointer"
            >
              {copiedCode === lastCreated ? 'تم النسخ!' : 'نسخ الكود'}
            </button>
          </div>
        )}

        <div className="p-2.5 bg-zinc-900/60 rounded-xl text-[11px] text-zinc-400 flex items-center gap-2">
          <Smartphone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>كل كود يلتصق بالجهاز الأول الذي يُفعله فورياً، ولا يمكن إعادة استخدامه على جهاز ثانٍ.</span>
        </div>
      </div>

      {/* Codes Table */}
      <div className="p-5 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-3">
        <h3 className="text-sm font-black text-white">سجل الأكواد المحفوظة</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 text-[11px]">
                <th className="py-2.5 px-2 text-start">الكود</th>
                <th className="py-2.5 px-2 text-start">المدة</th>
                <th className="py-2.5 px-2 text-start">الحالة</th>
                <th className="py-2.5 px-2 text-start">الجهاز المرتبط</th>
                <th className="py-2.5 px-2 text-start">الوقت المتبقي</th>
                <th className="py-2.5 px-2 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-zinc-500">
                    لا توجد أكواد بعد. قم بتوليد كود من الأعلى.
                  </td>
                </tr>
              ) : (
                codes
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((item) => {
                    const isExpired = item.expiresAt && now >= item.expiresAt;
                    const isActive = item.status === 'active' && item.boundDeviceId && !isExpired;

                    let remainingDisplay = '-';
                    if (isExpired) {
                      remainingDisplay = 'منتهي';
                    } else if (isActive && item.expiresAt) {
                      const rem = Math.max(0, Math.floor((item.expiresAt - now) / 1000));
                      const h = Math.floor(rem / 3600);
                      const m = Math.floor((rem % 3600) / 60);
                      remainingDisplay = `${h}س ${m}د`;
                    } else {
                      remainingDisplay = `${item.durationHours} ساعة`;
                    }

                    return (
                      <tr key={item.code} className="border-b border-white/5 hover:bg-zinc-900/40">
                        <td className="py-2.5 px-2 font-mono-cyber font-black text-white text-xs">
                          <div className="flex items-center gap-1.5">
                            <span>{item.code}</span>
                            <button
                              onClick={() => handleCopy(item.code)}
                              className="text-zinc-500 hover:text-white cursor-pointer"
                              title="نسخ"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-zinc-300">{item.durationHours}h</td>
                        <td className="py-2.5 px-2">
                          {isExpired ? (
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px] font-bold">
                              منتهي
                            </span>
                          ) : isActive ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                              نشط 🟢
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold">
                              جاهز ⏳
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-[10px] font-mono text-zinc-400">
                          {item.boundDeviceId ? (
                            <span title={item.boundDeviceId}>🔒 {item.boundDeviceLabel || 'جهاز مسجل'}</span>
                          ) : (
                            <span className="text-zinc-600">غير مرتبط بعد</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-xs">
                          {isActive ? (
                            <span className="text-emerald-400 font-bold">{remainingDisplay}</span>
                          ) : isExpired ? (
                            <span className="text-zinc-500">{remainingDisplay}</span>
                          ) : (
                            <span className="text-zinc-400">{remainingDisplay}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => handleDeleteCode(item.code)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-[#ff1e38] transition-colors cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
