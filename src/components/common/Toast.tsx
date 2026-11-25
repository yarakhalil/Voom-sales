import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 end-6 z-[100] animate-bounce duration-300">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-surface border border-border shadow-3 text-sm font-medium text-textMain">
        <CheckCircle2 className="w-5 h-5 text-status-ok flex-shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
