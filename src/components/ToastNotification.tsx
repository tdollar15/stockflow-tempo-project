import React, { useState, useEffect } from 'react';
import { ToastService, ToastType } from '../lib/services/ToastService';

export const ToastNotification: React.FC = () => {
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = ToastService.subscribe(setToasts);
    return () => unsubscribe();
  }, []);

  const getToastClasses = (type: ToastType) => {
    return `toast show ${type}`;
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={getToastClasses(toast.type)}
          style={{ animationDuration: `${toast.duration}ms` }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};
