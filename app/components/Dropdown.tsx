import React from "react"

interface DropdownProps {
  label?: string
  options: DropdownOptionsProps[]
  onSelect: (option: any) => void
  selected?: string
}

interface DropdownOptionsProps {
  label: string
  value: any
}

const Dropdown: React.FC<DropdownProps> = ({ label, selected, options, onSelect }) => {
  const [openDropdown, setOpenDropdown] = React.useState(false)
  return (
    <div className="flex flex-row flex-no-wrap items-center gap-1 sm:gap-2 text-xs sm:text-md">
      {label && <p className="whitespace-nowrap">{label}:&nbsp;</p>}
      <div className="relative inline-block">
        <button
          onClick={() => setOpenDropdown((prev) => !prev)}
          className="inline-flex justify-center items-center w-full px-2 py-1 bg-zinc-300 dark:bg-zinc-600 rounded-sm  hover:bg-zinc-200 dark:hover:bg-zinc-500 focus:outline-none cursor-pointer text-xs sm:text-sm"
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
          <div className="py-1 absolute mt-2 w-42 rounded-sm shadow-lg bg-zinc-200 dark:bg-zinc-800 ring-2 ring-zinc-300 dark:ring-zinc-700 z-50">
            {options.map((option, idx) => {
              return (
                <button
                  key={idx}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 cursor-pointer"
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