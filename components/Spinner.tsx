
import React from 'react';

export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`animate-spin rounded-full border-4 border-t-4 border-gray-600 border-t-blue-500 ${sizeClasses[size]}`} />
  );
};
