import React from 'react';
import { XCircleIcon } from './Icons';

interface ErrorDisplayProps {
  message: string | null;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm ${className}`}>
      <XCircleIcon className="w-5 h-5 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
};

export default ErrorDisplay;
