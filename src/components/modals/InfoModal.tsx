import React from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/sound';
import { Language } from '../../types';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-[32px] bg-[#0c0d12] border-2 border-white/10 p-6 shadow-2xl text-center space-y-4">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 w-9 h-9 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-13 h-13 mx-auto rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-[#ff1e38]">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-black text-white tracking-wide">
            {lang === 'ar' ? 'إخلاء مسؤولية رسمي' : 'Official Disclaimer'}
          </h3>
          <p className="text-[11px] text-zinc-400 font-mono mt-1">SMART AI v4.2 PRO</p>
        </div>

        <div className="space-y-2.5 text-xs text-zinc-300 text-start bg-zinc-900/80 p-4 rounded-2xl border border-white/5 leading-relaxed">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#ff1e38] shrink-0 mt-0.5" />
            <p>
              {lang === 'ar'
                ? 'يوفر هذا التطبيق توقعات ألعاب ذكية وإشارات تحليلية مباشرة بدقة 99%.'
                : 'This app provides smart game predictions and live analytical signals.'}
            </p>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#ff1e38] shrink-0 mt-0.5" />
            <p>
              {lang === 'ar'
                ? 'هذا ليس تطبيق مراهنة أو قمار إنما أداة تحليل إحصائي وإشارات رقمية للمستخدمين.'
                : 'This is not a betting or gambling application, but a statistical analysis tool.'}
            </p>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#ff1e38] shrink-0 mt-0.5" />
            <p>
              {lang === 'ar'
                ? 'التوقعات والإشارات للأغراض التعليمية والتحليلية للمنصات المعتمدة.'
                : 'Signals are intended for educational and analytical purposes on verified platforms.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full h-11 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          {lang === 'ar' ? 'إغلاق' : 'Close'}
        </button>
      </div>
    </div>
  );
};
