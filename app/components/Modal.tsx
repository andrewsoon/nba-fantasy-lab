"use client";
import React, { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  onSubmit?: () => void;
  submitDisabled?: boolean;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, onSubmit, submitDisabled }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose} // close when clicking background
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Title */}
        {title && (
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            {title}
          </h2>
        )}

        {/* Content */}
        <div className="mb-5 text-zinc-700 dark:text-zinc-300">{children}</div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="
              px-4 py-2 rounded-lg border border-zinc-400 dark:border-zinc-600
              text-zinc-700 dark:text-zinc-300
              hover:bg-zinc-100 dark:hover:bg-zinc-700
              transition-colors
              cursor-pointer
            "
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="
              px-4 py-2 rounded-lg bg-amber-600 text-white
              hover:bg-amber-500 transition-colors
              cursor-pointer
              disabled:bg-zinc-700 disabled:text-zinc-400
              disabled:cursor-not-allowed disabled:hover:bg-zinc-700
            "
            disabled={submitDisabled}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
