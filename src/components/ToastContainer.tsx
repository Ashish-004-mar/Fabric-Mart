import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast, ToastItem } from '../context/ToastContext';
import { OrderStatus } from '../types';
import { CheckCircle2, Clock, AlertTriangle, Truck, PackageCheck, Scissors, X, Bell, Zap } from 'lucide-react';

const STATUS_CONFIG: Record<
  OrderStatus,
  { bg: string; border: string; text: string; iconBg: string; icon: React.ReactNode }
> = {
  Pending: {
    bg: 'bg-slate-900/95 dark:bg-slate-900/95 text-white',
    border: 'border-blue-500/40',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/20 text-blue-400',
    icon: <Clock className="w-4 h-4" />,
  },
  Confirmed: {
    bg: 'bg-slate-900/95 dark:bg-slate-900/95 text-white',
    border: 'border-indigo-500/40',
    text: 'text-indigo-400',
    iconBg: 'bg-indigo-500/20 text-indigo-400',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  Preparing: {
    bg: 'bg-slate-900/95 dark:bg-slate-900/95 text-white',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/20 text-amber-400',
    icon: <Scissors className="w-4 h-4" />,
  },
  'Ready for Dispatch': {
    bg: 'bg-slate-900/95 dark:bg-slate-900/95 text-white',
    border: 'border-cyan-500/50',
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/20 text-cyan-400',
    icon: <PackageCheck className="w-4 h-4" />,
  },
  Shipped: {
    bg: 'bg-slate-900/95 dark:bg-slate-900/95 text-white',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/20 text-blue-400',
    icon: <Truck className="w-4 h-4" />,
  },
  Completed: {
    bg: 'bg-slate-900/95 dark:bg-slate-900/95 text-white',
    border: 'border-emerald-500/50',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  Rejected: {
    bg: 'bg-slate-900/95 dark:bg-slate-900/95 text-white',
    border: 'border-rose-500/50',
    text: 'text-rose-400',
    iconBg: 'bg-rose-500/20 text-rose-400',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  Cancelled: {
    bg: 'bg-slate-900/95 dark:bg-slate-900/95 text-white',
    border: 'border-rose-500/50',
    text: 'text-rose-400',
    iconBg: 'bg-rose-500/20 text-rose-400',
    icon: <X className="w-4 h-4" />,
  },
};

const SingleToast: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 6000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const config = (toast.status && STATUS_CONFIG[toast.status]) || {
    bg: 'bg-slate-900/95 text-white',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/20 text-blue-400',
    icon: <Bell className="w-4 h-4" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`pointer-events-auto w-full p-4 rounded-2xl border ${config.border} ${config.bg} shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col gap-2`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${config.iconBg}`}>{config.icon}</div>
          <span className={`text-[11px] font-extrabold uppercase tracking-wider ${config.text}`}>
            REAL-TIME EVENT
          </span>
          {toast.status && (
            <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
              {toast.status}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-mono">{toast.timestamp}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title & Body Message */}
      <div>
        <h4 className="text-xs font-bold text-white leading-snug">{toast.title}</h4>
        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
      </div>

      {/* Progress Auto-Dismiss Bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: (toast.duration || 6000) / 1000, ease: 'linear' }}
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
      />
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none">
      {/* Stacked Animated Toasts */}
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <SingleToast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
