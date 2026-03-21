import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import Toast from '../components/Toast';

interface ToastContextType {
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: React.PropsWithChildren) => {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [type, setType] = useState<'success' | 'error' | 'info'>('success');
  
  const addToast = useCallback((msg: string, t: 'success' | 'error' | 'info' = 'success') => {
    setMessage(msg);
    setType(t);
    setIsVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setIsVisible(false);
    setMessage('');
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {isVisible && <Toast message={message} type={type} onClose={hideToast} />}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
