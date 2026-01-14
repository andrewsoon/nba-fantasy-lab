import React from "react"

interface DropdownProps<T = unknown> {
  label?: string
  options: DropdownOptionsProps[]
  onSelect: (option: T) => void
  selected?: string
  dropdownClasses?: DropdownClasses
}

interface DropdownClasses {
  label?: string
  button?: string
  options?: string
}

interface DropdownOptionsProps<T = unknown> {
  label: string
  value: T
}

const Dropdown: React.FC<DropdownProps> = ({ label, selected, options, onSelect, dropdownClasses }) => {
  const [openDropdown, setOpenDropdown] = React.useState(false)
  return (
    <div className="flex flex-row flex-no-wrap items-center gap-1 sm:gap-2 text-xs sm:text-base">
      {label && <p className={`whitespace-nowrap text:xs sm:text-sm ${dropdownClasses?.label}`}>{label}:</p>}
      <div className="relative inline-block">
        <button
          onClick={() => setOpenDropdown((prev) => !prev)}
          className={`
            inline-flex justify-between items-center w-full 
            px-2 sm:px-4 py-1 sm:py-2 
            rounded-sm 
            bg-zinc-200 dark:bg-zinc-800 
            hover:bg-zinc-100 dark:hover:bg-zinc-700 
            transition-colors 
            focus:outline-none 
            cursor-pointer 
            text-xs sm:text-sm 
            ${dropdownClasses?.button} 
            shadow-md dark:shadow-none
            whitespace-nowrap
            `}
        >
          {selected ?? 'Select'}
          <svg
            className={`ml-2 h-4 w-4 transition-transform duration-200 ${openDropdown ? "rotate-180" : "rotate-0"}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {openDropdown && (
          <div className="py-1 absolute mt-2 w-full rounded-sm shadow-lg bg-zinc-200 dark:bg-zinc-800 ring-2 ring-zinc-300 dark:ring-zinc-700 z-50">
            {options.map((option, idx) => {
              return (
                <button
                  key={idx}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer ${dropdownClasses?.options}`}
                  onClick={() => {
                    onSelect(option.value)
                    setOpenDropdown(false)
                  }}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div >
  )

}

export default Dropdown