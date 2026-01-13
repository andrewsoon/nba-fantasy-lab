import React from "react";

interface RadialOption {
  label: string;
  value: string;
}

interface RadialButtonProps<T = unknown> {
  options: RadialOption[];
  selected: string;
  onChange: (value: T) => void;
}

export const RadialButtonGroup: React.FC<RadialButtonProps> = ({
  options,
  selected,
  onChange,
}) => {
  return (
    <div className="flex gap-4">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="radial-group"
            value={opt.value}
            checked={selected === opt.value}
            onChange={() => onChange(opt.value)}
            className="sr-only peer"
          />
          <div
            className={`
              w-3 h-3 rounded-full border-2
              flex items-center justify-center
              transition-all duration-200
              border-zinc-400 dark:border-zinc-600
              peer-checked:border-zinc-800 dark:peer-checked:border-zinc-300
              peer-checked:bg-zinc-800 dark:peer-checked:bg-zinc-300
              hover:border-zinc-600 dark:hover:border-zinc-500
            `}
          >
            <div
              className={`
                w-1 h-1 rounded-full
                opacity-0 peer-checked:opacity-100
                transition-opacity duration-200
                bg-white dark:bg-black
              `}
            ></div>
          </div>
          <span
            className={`
              ml-2 transition-colors duration-200
              text-zinc-700 dark:text-zinc-300
              peer-checked:text-zinc-900 dark:peer-checked:text-zinc-100
              text-nowrap
            `}
          >
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
};
