"use client"
import React from "react";

interface Toast {
  id: number;
  message: string;
}

export const useToast = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback((message: string, duration = 3000) => {
    const id = Date.now(); // simple unique id
    setToasts(prev => [...prev, { id, message }]);

    // remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  return { toasts, showToast };
};
