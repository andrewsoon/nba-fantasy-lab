
interface CheckboxProps {
  label: string,
  checked: boolean,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {

  return (
    <label
      className="
        flex items-center gap-3 cursor-pointer select-none
        text-zinc-700 dark:text-zinc-300
      "
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="
          h-5 w-5 rounded-md border
          border-zinc-400 dark:border-zinc-600
          bg-white dark:bg-zinc-800
          checked:bg-zinc-900 checked:border-zinc-900
          dark:checked:bg-zinc-200 dark:checked:border-zinc-200
          transition-colors duration-150
        "
      />
      <span>{label}</span>
    </label>
  );
}

export default Checkbox
