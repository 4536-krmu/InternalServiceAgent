import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgClass = "bg-white border-slate-200 text-slate-800";
        let Icon = Info;
        let iconColor = "text-blue-500";

        if (toast.type === 'success') {
          bgClass = "bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100 shadow-emerald-500/10";
          Icon = CheckCircle2;
          iconColor = "text-emerald-500";
        } else if (toast.type === 'error') {
          bgClass = "bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-800/60 text-slate-800 dark:text-slate-100 shadow-rose-500/10";
          Icon = AlertCircle;
          iconColor = "text-rose-500";
        } else if (toast.type === 'warning') {
          bgClass = "bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800/60 text-slate-800 dark:text-slate-100 shadow-amber-500/10";
          Icon = AlertTriangle;
          iconColor = "text-amber-500";
        } else {
          bgClass = "bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/60 text-slate-800 dark:text-slate-100 shadow-blue-500/10";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all duration-300 transform translate-y-0 ${bgClass}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{toast.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
