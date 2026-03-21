import React, { useEffect } from 'react';
import { CheckCircle, X } from './Icons';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000, type = 'success' }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeClasses = {
    success: 'bg-green-500/20 border-green-500/50 text-green-100',
    error: 'bg-red-500/20 border-red-500/50 text-red-100',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-100',
  };

  const Icon = type === 'success' ? CheckCircle : type === 'error' ? X : CheckCircle;

  return (
    <div className={`fixed bottom-16 sm:bottom-4 right-4 z-50 p-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in-up backdrop-blur-md border ${typeClasses[type]}`}>
      <Icon className="w-6 h-6 flex-shrink-0" />
      <span className="font-semibold">{message}</span>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/10 transition-colors" aria-label="Close notification">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
