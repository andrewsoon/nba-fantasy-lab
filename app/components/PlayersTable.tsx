"use client"

import PlayersDataRaw from "@/data/players.json";
import { PlayerRow, PlayerRowKeys, usePlayersData } from "@/hooks/usePlayersData";
import { DatasetKeys } from "@/types/player";
import { getHeatmapColor, weightedFG } from "@/utils/playersTable";
import Image from "next/image";
import React from "react";
import Dropdown from "./Dropdown";

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

const datasetLabels: Record<DatasetKeys | string, string> = {
  season_avgs: "Season averages",
  season_totals: "Season totals",
  last7_avgs: "Last 7 days averages",
  last7_totals: "Last 7 days totals",
  last14_avgs: "Last 14 days averages",
  last14_totals: "Last 14 days totals"
}

interface SortProps {
  sortBy: PlayerRowKeys,
  isDesc: boolean
}

export function PlayersTable() {
  const [dataset, setDataset] = React.useState<DatasetKeys>('season_avgs')
  const [sort, setSort] = React.useState<SortProps>({ sortBy: 'rank', isDesc: false })
  const [isDarkMode, setIsDarkMode] = React.useState<boolean | undefined>(undefined);
  const [useWeightedPct, setUseWeightedPct] = React.useState<boolean>(true)

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

  return (
    <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6 pt-2 bg-zinc-100 dark:bg-zinc-900 shadow-xl dark:shadow-none rounded-xl m-3">
      <div className="flex flex-row justify-center pb-1">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">Last updated at: {new Date(PlayersDataRaw._meta.fetched_at).toISOString()}</p>
      </div>
      <div className="px-4 py-4 rounded-md">
        <div className="px-1 py-2 sm:px-4 sm:py-4 flex flex-col sm:flex-row justify-start gap-4 sm:gap-8">
          <Dropdown
            label="Data from"
            options={Object.entries(datasetLabels).map(([value, label]) => {
              return { label, value }
            })}
            onSelect={setDataset}
            selected={datasetLabels[dataset]}
          />
          <label className="inline-flex items-center space-x-2 hidden" hidden>
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 accent-green-500"
              checked={useWeightedPct}
              onChange={(e) => setUseWeightedPct(e.target.checked)} // <-- update state here
            />
            <span>Use weighted percentage</span>
          </label>
        </div>
        {isLoading ?
          <div className="h-32 flex flex-row items-center justify-center">
            <div className="animate-spin rounded-full border-2 border-zinc-300 border-t-transparent h-12 w-12" />
          </div>
          : <div className="overflow-x-auto rounded-sm">
            <table className="min-w-full">
              <thead>
                <tr className={headerRowClass}>
                  <th
                    className={`sticky left-0 ${headerClass} bg-zinc-400 dark:bg-zinc-700 relative border-r-0`}
                    onClick={() =>
                      setSort((prev) => ({
                        ...prev,
                        sortBy: "rank",
                        isDesc: prev.sortBy !== "rank" ? false : !prev.isDesc,
                      }))
                    }
                  >
                    RK
                    {sort.sortBy === "rank" && (
                      <span className="ml-1 text-xs">
                        {!sort.isDesc ? "▼" : "▲"}
                      </span>
                    )}
                  </th>
                  <th className={`sticky left-0 ${headerClass} bg-zinc-400 dark:bg-zinc-700 relative border-r-0`}>
                    Player
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
                        <td className={cellClass}>{player.rank ?? '-'}</td>
                        <td className={`sticky left-0 ${cellClass} min-w-40 ${id % 2 === 0 ? ' bg-zinc-200 dark:bg-zinc-800' : 'bg-zinc-100 dark:bg-zinc-900'} relative border-r-0`}>
                          <div className="flex flex-row items-center gap-1 sm:gap-2">
                            <Image
                              src={`https://cdn.nba.com/headshots/nba/latest/260x190/${player.id}.png`}
                              alt={`${player.id}-headshot`}
                              width={100} // original image width
                              height={100} // original image height
                              className="h-6 sm:h-10 w-auto"
                            />
                            <p>{player.name}</p>
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

                          if (col.key === 'fg_pct' && useWeightedPct) {
                            value = weightedFG(player.fg_pct, player.fga)
                            min = minMax.fg_weighted.min
                            max = minMax.fg_weighted.max
                          }

                          if (col.key === 'ft_pct' && useWeightedPct) {
                            value = weightedFG(player.ft_pct, player.fta)
                            min = minMax.ft_weighted.min
                            max = minMax.ft_weighted.max
                          }

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
                          <th className={headerClass}>Rk</th>
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
        }
      </div>
    </div>
  )
}

const headerClass = "border border-2 border-zinc-500 dark:border-zinc-500 px-2 py-1.5 sm:px-4 sm:py-2"
const headerRowClass = "text-left text-sm md:text-md text-zinc-100 font-semibold bg-zinc-400 dark:bg-zinc-700"
const cellClass = "border border-t-2 border-zinc-500 dark:border-zinc-600 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm md:text-md md:font-medium lg:text-lg"