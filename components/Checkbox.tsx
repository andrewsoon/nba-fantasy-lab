
interface CheckboxProps {
  checkboxLabel?: React.ReactNode,
  checked: boolean,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean,
  variant?: 'flag' | 'regular'
}

const Checkbox: React.FC<CheckboxProps> = ({ checkboxLabel, checked, onChange, disabled, variant = 'regular' }) => {
  if (variant === 'regular') return (
    <label
      className="
        flex items-center gap-3
        text-zinc-700 dark:text-zinc-300
      "
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="
          appearance-none
          h-4 w-4 rounded-sm border
          border-zinc-300 dark:border-zinc-600
          bg-white dark:bg-zinc-800
          checked:bg-zinc-600 dark:checked:bg-zinc-400
          
          dark:checked:border-zinc-600
          transition-colors duration-150
          cursor-pointer

          disabled:bg-zinc-300 dark:disabled:bg-zinc-700
          disabled:border-zinc-400 dark:disabled:border-zinc-600
          disabled:cursor-not-allowed
          disabled:checked:bg-zinc-400
        "
      />
      {checkboxLabel && <span>{checkboxLabel}</span>}
    </label>
  )
  return (
    <label
      className="
        flex items-center gap-3
        cursor-pointer
        text-zinc-700 dark:text-zinc-300
        disabled:cursor-not-allowed
      "
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="peer sr-only"
      />
      {/* Visual checkbox */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="
          h-4 w-4
          text-zinc-300 dark:text-zinc-500
          hover:text-zinc-400 hover:dark:text-zinc-400

          peer-checked:text-amber-600
          hover:peer-checked:text-amber-500
          dark:peer-checked:text-amber-400
          hover:dark:peer-checked:text-amber-500

          peer-disabled:text-zinc-400 dark:peer-disabled:text-zinc-600
          transition-colors
        "
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
        />
      </svg>
      {checkboxLabel && <span>{checkboxLabel}</span>}
    </label>
  );
}

export default Checkbox
