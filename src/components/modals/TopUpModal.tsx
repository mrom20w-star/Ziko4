import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/sound';
import { Language } from '../../types';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-[32px] bg-[#0c0d12] border-2 border-amber-500/50 p-6 shadow-[0_0_40px_rgba(245,158,11,0.25)] text-center space-y-4">
        <div className="w-13 h-13 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-lg font-black text-white tracking-wide">
            {lang === 'ar' ? 'تنبيه تنشيط الحساب' : 'Account Activation Alert'}
          </h3>
          <p className="text-xs text-zinc-300 mt-2 leading-relaxed bg-zinc-900/80 p-3.5 rounded-2xl border border-white/5">
            {lang === 'ar'
              ? 'يجب عليك إجراء إيداع للحد الأدنى (150 جنيه / $3) لكي تظهر التوقعات الصحيحة وتعمل الخوارزمية بدقة 99%.'
              : 'You must make a deposit for the minimum amount ($3 / 150 L.E) in order for the correct predictions to appear and sync with 99% accuracy.'}
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span>{lang === 'ar' ? 'موافق، سأقوم بالإيداع' : 'OK, I will deposit'}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};
