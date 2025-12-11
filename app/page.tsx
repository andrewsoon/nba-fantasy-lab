import { PlayersHistoricStats } from "./components/PlayersHistoricStats";
import ScrollToTopButton from "./components/ScrollToTopButton";

export default function Home() {
  return (
    <div>
      <div className="flex flex-col items-center py-5 sm:py-10 md:py-15 px-10 sm:px-14 md:px-20">
        <div className="flex flex-col items-center gap-2 sm:gap-4 text-center">
          <h3 className="text-base sm:text-4xl lg:text-5xl font-semibold text-zinc-700 dark:text-zinc-200">
            Master the Game with Heatmaps
          </h3>
          <p className="text-sm sm:text-lg text-zinc-700 dark:text-zinc-300 max-w-250">
            Explore performance trends, compare categories, and make data-driven decisions.
          </p>
        </div>
      </div>
      <PlayersHistoricStats />
      <ScrollToTopButton />
    </div>
  );
}
