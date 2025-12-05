import { PlayerRow, PlayerRowKeys, usePlayersData } from "@/hooks/usePlayersData";
import { DatasetKeys } from "@/types/player";
import { getHeatmapColor } from "@/utils/playersTable";
import Image from "next/image";
import React from "react";

interface PlayersHeatmapProps {
  dataset: DatasetKeys,
}

interface SortProps {
  sortBy: PlayerRowKeys,
  isDesc: boolean
}

interface StatColumn {
  key: PlayerRowKeys,
  label: string,
  invert?: boolean,
  render?: (player: PlayerRow) => React.ReactNode,
}

const statColumns: StatColumn[] = [
  {
    key: "fg_pct", label: "FG%", render: (statCol: PlayerRow) => (
      <div className="flex gap-1">
        <p>{statCol.fg_pct.toFixed(3)}</p>
        <p className="text-xs">({statCol.fgm.toFixed(1)}/{statCol.fga.toFixed(1)})</p>
      </div>
    )
  },
  {
    key: "ft_pct", label: "FT%", render: (statCol: PlayerRow) => (
      <div className="flex gap-1">
        <p>{statCol.ft_pct.toFixed(3)}</p>
        <p className="text-xs">({statCol.ftm.toFixed(1)}/{statCol.fta.toFixed(1)})</p>
      </div>
    )
  },
  { key: "fg3m", label: "3PM" },
  { key: "pts", label: "PTS" },
  { key: "reb", label: "REB" },
  { key: "ast", label: "AST" },
  { key: "stl", label: "STL" },
  { key: "blk", label: "BLK" },
  { key: "tov", label: "TOV", invert: true },
];


export default function PlayersHeatmap({ dataset }: PlayersHeatmapProps) {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean | undefined>(undefined);
  const [sort, setSort] = React.useState<SortProps>({ sortBy: 'rank', isDesc: false })
  const { rows: playerRows, minMax, loading: processingPlayers } = usePlayersData(dataset)

  React.useEffect(() => {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkQuery.matches);

    const listener = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkQuery.addEventListener('change', listener);

    return () => darkQuery.removeEventListener('change', listener);
  }, []);

  const sortedPlayerRows = React.useMemo(() => {
    return [...playerRows].sort((a, b) => {
      const valA = a[sort.sortBy];
      const valB = b[sort.sortBy];

      // If both are numbers
      if (typeof valA === "number" && typeof valB === "number") {
        return sort.isDesc ? valB - valA : valA - valB;
      }

      // If both are strings
      if (typeof valA === "string" && typeof valB === "string") {
        return sort.isDesc
          ? valB.localeCompare(valA)
          : valA.localeCompare(valB);
      }

      // Fallback if types are mixed or undefined
      return 0;
    });
  }, [playerRows, sort]);

  const isLoading = React.useMemo(() => {
    return isDarkMode === undefined || processingPlayers
  }, [isDarkMode, processingPlayers])

  if (isLoading) {
    return (
      <div className="h-32 flex flex-row items-center justify-center">
        <div className="animate-spin rounded-full border-2 border-zinc-300 border-t-transparent h-12 w-12" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-sm">
      <table className="min-w-full">
        <thead>
          <tr className={headerRowClass}>
            <th
              className={`sticky left-0 ${headerClass} bg-zinc-400 dark:bg-zinc-700 relative border-r-0 cursor-pointer`}
              onClick={() =>
                setSort((prev) => ({
                  ...prev,
                  sortBy: "rank",
                  isDesc: prev.sortBy !== "rank" ? false : !prev.isDesc,
                }))
              }
            >
              Player Rank
              {sort.sortBy === "rank" && (
                <span className="ml-1 text-xs">
                  {!sort.isDesc ? "▼" : "▲"}
                </span>
              )}
              <span className="absolute top-0 right-0 h-full w-[3px] bg-zinc-500"></span>
            </th>
            <th className={`${headerClass} border-l-0`}>Team</th>
            <th
              className={`${headerClass} cursor-pointer`}
              onClick={() =>
                setSort((prev) => ({
                  ...prev,
                  sortBy: "gp",
                  isDesc: prev.sortBy !== "gp" ? true : !prev.isDesc,
                }))
              }
            >
              GP
              {sort.sortBy === "gp" && (
                <span className="ml-1 text-xs">
                  {sort.isDesc ? "▼" : "▲"}
                </span>
              )}
            </th>
            {statColumns.map((col) => (
              <th key={col.key} className={`${headerClass} cursor-pointer`}
                onClick={() =>
                  setSort((prev) => ({
                    ...prev,
                    sortBy: col.key,
                    isDesc: prev.sortBy !== col.key ? !col.invert : !prev.isDesc,
                  }))
                }>
                {col.label}
                {sort.sortBy === col.key && (
                  <span className="ml-1 text-xs">
                    {(!col.invert ? sort.isDesc : !sort.isDesc) ? "▼" : "▲"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedPlayerRows.map((player, id) => {
            return (
              <React.Fragment key={`${id}-row`}>
                <tr key={`${player.id}-stats`} className={`${id % 2 === 0 ? ' bg-zinc-200 dark:bg-zinc-800' : 'bg-zinc-100 dark:bg-zinc-900'}`}>
                  <td className={`sticky left-0 ${cellClass} ${id % 2 === 0 ? ' bg-zinc-200 dark:bg-zinc-800' : 'bg-zinc-100 dark:bg-zinc-900'} relative border-r-0`}>
                    <div className="flex flex-row items-center gap-1 sm:gap-2">
                      {player.rank ?? '-'}.&nbsp;
                      <Image
                        src={`https://cdn.nba.com/headshots/nba/latest/260x190/${player.id}.png`}
                        alt={`${player.id}-headshot`}
                        width={100} // original image width
                        height={100} // original image height
                        className="hidden md:block h-6 sm:h-10 w-auto"
                      />
                      <p className="overflow-hidden overflow-ellipsis max-w-20 sm:max-w-none">{player.name}</p>
                      <span className="absolute top-0 right-0 h-full w-[3px] bg-zinc-500"></span>
                    </div>
                  </td>
                  <td className={`${cellClass} border-l-0`}>{player.team}</td>
                  <td className={cellClass}>{player.gp}</td>
                  {statColumns.map((col) => {
                    minMax
                    let value = player[col.key] as number;
                    let min = minMax[col.key].min
                    let max = minMax[col.key].max

                    const bgColor = getHeatmapColor(
                      value,
                      min,
                      max,
                      col.invert,
                      isDarkMode,
                    );

                    return (
                      <td
                        key={col.key}
                        className={cellClass}
                        style={{ backgroundColor: bgColor }}
                      >
                        {col.render ? col.render(player) : value.toFixed(1)}
                      </td>
                    );
                  })}
                </tr>
                {(id + 1) % 15 === 0 && (
                  <tr key={id} className={headerRowClass}>
                    <th className={`sticky left-0 ${headerClass} bg-zinc-400 dark:bg-zinc-700 relative border-r-0`}>
                      Player
                      <span className="absolute top-0 right-0 h-full w-[3px] bg-zinc-500"></span>
                    </th>
                    <th className={`${headerClass} border-l-0`}>Team</th>
                    <th className={headerClass}>GP</th>
                    {statColumns.map((col) => (
                      <th key={col.key} className={headerClass}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const headerClass = "border border-2 border-zinc-500 dark:border-zinc-500 px-2 py-1.5 sm:px-4 sm:py-2"
const headerRowClass = "text-left text-sm md:text-md text-zinc-100 font-semibold bg-zinc-400 dark:bg-zinc-700"
const cellClass = "border border-t-2 border-zinc-500 dark:border-zinc-600 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm md:text-md md:font-medium lg:text-lg"