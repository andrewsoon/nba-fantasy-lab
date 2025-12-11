
interface CheckboxProps {
  label: string,
  checked: boolean,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean,
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, disabled }) => {

  return (
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
          checked:bg-amber-600 
          checked:border-zinc-900
          dark:checked:border-zinc-600
          transition-colors duration-150
          cursor-pointer

          disabled:bg-zinc-300 dark:disabled:bg-zinc-700
          disabled:border-zinc-400 dark:disabled:border-zinc-600
          disabled:cursor-not-allowed
          disabled:checked:bg-zinc-400
        "
      />
      <span>{label}</span>
    </label>
  );
}

export default Checkbox
