import React, { useState } from "react";

interface TooltipProps {
  message: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({
  message,
  children,
  position = "top",
}) => {
  const [visible, setVisible] = useState(false);

  // Tailwind positioning classes
  const positionClasses: Record<string, string> = {
    top: "bottom-full mb-2 left-1/2 transform -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 transform -translate-x-1/2",
    left: "right-full mr-2 top-1/2 transform -translate-y-1/2",
    right: "left-full ml-2 top-1/2 transform -translate-y-1/2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}

      {visible && (
        <div
          className={`
            absolute z-50 px-2 py-1 text-xs rounded shadow-lg whitespace-nowrap
            ${positionClasses[position]}
            opacity-95
            bg-zinc-200 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-200
            transition-opacity duration-150 ease-in-out
          `}
        >
          {message}
        </div>
      )}
    </div>
  );
};
