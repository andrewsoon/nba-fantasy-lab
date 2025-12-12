import React from "react";

interface ToastContainerProps {
  toasts: { id: number; message: string }[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="fixed bottom-30 right-4 flex flex-col gap-2 z-50">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};
