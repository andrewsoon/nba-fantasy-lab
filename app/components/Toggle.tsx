
"use client";
import React from "react";

interface ToggleProps {
  label: string,
  enabled: boolean,
  onChange: (value: boolean) => void
}

const Toggle: React.FC<ToggleProps> = ({ label, enabled, onChange }) => {
  return (
    <div className="flex flex-row gap-3 items-center">
      <button
        onClick={() => onChange(!enabled)}
        className={`
        relative inline-flex h-5 w-10 items-center rounded-full
        ${enabled ? "bg-amber-600" : "bg-zinc-300 dark:bg-zinc-600"}
        transition-colors duration-150
        cursor-pointer
      `}
      >
        <span
          className={`
          inline-block h-4 w-4 transform rounded-full bg-white
          transition-transform duration-150
          ${enabled ? "translate-x-5" : "translate-x-1"}
        `}
        />
      </button>
      <p className="text-xs sm:text-sm md:text-base">{label}</p>
    </div>
  );
}

export default Toggle