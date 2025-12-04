import { PlayersTable } from "./PlayersTable";

export default function Home() {
  return (
    <div>
      <div className="flex flex-col items-center gap-3 sm:gap-6 py-6 md:py-8 px-10 sm:px-14 md:px-20">
        <h1 className="text-lg sm:text-4xl md:text-6xl lg:text-5xl font-extrabold flex flex-row items-center gap-1 sm:gap-3 ">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 sm:w-10 h-5 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="#FFBF00">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a9.99 9.99 0 016.364 2.364A10 10 0 0112 22a9.99 9.99 0 01-6.364-2.364A10 10 0 0112 2zm0 0v20m-7.071-7.071h14.142M4.929 4.929c4.686 4.686 4.686 9.456 0 14.142M19.071 4.929c-4.686 4.686-4.686 9.456 0 14.142" />
          </svg>
          NBA Fantasy Lab
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 sm:w-10 h-5 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="#FFBF00">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a9.99 9.99 0 016.364 2.364A10 10 0 0112 22a9.99 9.99 0 01-6.364-2.364A10 10 0 0112 2zm0 0v20m-7.071-7.071h14.142M4.929 4.929c4.686 4.686 4.686 9.456 0 14.142M19.071 4.929c-4.686 4.686-4.686 9.456 0 14.142" />
          </svg>
        </h1>
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-md sm:text-2xl font-semibold text-zinc-700 dark:text-zinc-200">
            Explore, Analyse, and Build Your Winning Strategy
          </h3>
          <p className="text-sm sm:text-lg text-zinc-700 dark:text-zinc-300 max-w-250">
            Use interactive heatmaps to spot category strengths, compare trends across time windows, and experiment with roster builds designed to maximise weekly H2H edges in your fantasy matchups.
          </p>
        </div>
      </div>
      <PlayersTable />
    </div>
  );
}
