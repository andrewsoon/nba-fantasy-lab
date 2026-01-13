import { useState, ReactNode } from "react";

interface Tab {
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultIndex?: number;
  labelEndComponent?: ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultIndex = 0, labelEndComponent }) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <div className="w-full mx-auto">
      {/* Tab List */}
      <div
        className="flex justify-between items-end border-b-1 border-zinc-200 dark:border-zinc-800"
      >
        <div
          role="tablist"
          className="flex"
        >
          {tabs.map((tab, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={index}
                role="tab"
                onClick={() => setActiveIndex(index)}
                className={`
                px-4 py-2 text-sm font-medium transition-colors duration-150
                text-zinc-600 hover:text-zinc-900
                dark:text-zinc-400 dark:hover:text-zinc-100
                ${isActive ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100" : ""}
                cursor-pointer
              `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {labelEndComponent}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={index}
              role="tabpanel"
              className={
                isActive
                  ? "block"
                  : "hidden"
              }
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};
