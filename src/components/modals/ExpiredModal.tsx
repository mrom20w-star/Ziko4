import React from 'react';
import { TimerOff, AlertTriangle, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/sound';
import { Language } from '../../types';

interface ExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ExpiredModal: React.FC<ExpiredModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-[32px] bg-[#0c0d12] border-2 border-red-500/60 p-6 shadow-[0_0_50px_rgba(255,30,56,0.35)] text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center justify-center text-[#ff1e38] shadow-neon-red">
          <TimerOff className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-xl font-black text-white tracking-wide">
            {lang === 'ar' ? 'انتهت مدة صلاحية الكود' : 'Code Expired'}
          </h3>
          <p className="text-xs text-zinc-300 mt-2 leading-relaxed bg-zinc-900/80 p-3.5 rounded-2xl border border-white/5">
            {lang === 'ar'
              ? 'انتهت مدة الاشتراك المحددة للكود وتم إخراجك من السكريبت تلقائياً. للحصول على كود جديد، يرجى التواصل مع المسؤول.'
              : 'Your code duration has elapsed and you have been automatically logged out. Contact the admin to request a new code.'}
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-red-600 to-[#ff1e38] hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-neon-red transition-all cursor-pointer"
        >
          <span>{lang === 'ar' ? 'إدخال كود جديد' : 'Enter New Code'}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};
