"use client"

import PlayersDataRaw from "@/data/players.json";
import { PlayerRow, PlayerRowKeys, usePlayersData } from "@/hooks/usePlayersData";
import { DatasetKeys, StatCategory } from "@/types/player";
import { getHeatmapColor } from "@/utils/playersTable";
import Image from "next/image";
import React from "react";
import Dropdown from "./components/Dropdown";

interface StatColumn {
  key: PlayerRowKeys,
  label: string,
  invert?: boolean,
  render?: (player: PlayerRow) => React.ReactNode,
}

const statColumns: StatColumn[] = [
  {
    key: "fg_pct", label: "FG%", render: (cat: PlayerRow) => (
      <div className="flex gap-1">
        <p>{cat.fg_pct.toFixed(3)}</p>
        <p className="text-xs">({cat.fgm.toFixed(1)}/{cat.fga.toFixed(1)})</p>
      </div>
    )
  },
  {
    key: "ft_pct", label: "FT%", render: (cat: PlayerRow) => (
      <div className="flex gap-1">
        <p>{cat.ft_pct.toFixed(3)}</p>
        <p className="text-xs">({cat.ftm.toFixed(1)}/{cat.fta.toFixed(1)})</p>
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
  const [statType, setStatType] = React.useState<DatasetKeys>('last14_avgs')
  const [sort, setSort] = React.useState<SortProps>({ sortBy: 'pts', isDesc: true })
  const [useWeightedPct, _setUseWeightedPct] = React.useState<boolean>(false)
  const [isDarkMode, setIsDarkMode] = React.useState<boolean | undefined>(undefined);

  const { rows: playerRows, minMax } = usePlayersData(statType)

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
    return isDarkMode === undefined
  }, [isDarkMode])

  if (isLoading) {
    return (
      <div className="h-32 flex flex-row items-center justify-center">
        <div className="animate-spin rounded-full border-2 border-gray-300 border-t-transparent h-12 w-12" />
      </div>
    )
  }

  return (
    <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6">
      <div className="flex flex-row justify-end pb-1">
        <p className="text-xs">Last updated at: {new Date(PlayersDataRaw._meta.fetched_at).toLocaleString()}</p>
      </div>
      <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-4 rounded-md">
        <div className="px-1 py-2 sm:px-4 sm:py-4 flex flex-col sm:flex-row justify-start gap-4 sm:gap-8">
          <Dropdown
            label="Data from"
            options={Object.entries(datasetLabels).map(([value, label]) => {
              return { label, value }
            })}
            onSelect={setStatType}
            selected={datasetLabels[statType]}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th
                  className={`${headerClass} cursor-pointer`}
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
                <th className={`sticky left-0 ${headerClass}`}>Player</th>
                <th className={headerClass}>Team</th>
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
                <th
                  className={`${headerClass} cursor-pointer`}
                  onClick={() =>
                    setSort((prev) => ({
                      ...prev,
                      sortBy: "rating",
                      isDesc: prev.sortBy !== "rating" ? true : !prev.isDesc,
                    }))
                  }
                >
                  Rating
                  {sort.sortBy === "rating" && (
                    <span className="ml-1 text-xs">
                      {sort.isDesc ? "▼" : "▲"}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayerRows.map((player, id) => {
                return (
                  <React.Fragment key={`${id}-row`}>
                    <tr key={`${player.id}-stats`}>
                      <td className={cellClass}>{player.rank ?? '-'}</td>
                      <td className={`sticky left-0 ${cellClass} min-w-50`}>
                        <div className="flex flex-row items-center gap-1 sm:gap-2">
                          <Image
                            src={`https://cdn.nba.com/headshots/nba/latest/260x190/${player.id}.png`}
                            alt={`${player.id}-headshot`}
                            width={100} // original image width
                            height={100} // original image height
                            className="h-6 sm:h-10 w-auto"
                          />
                          <p>{player.name}</p>
                        </div>
                      </td>
                      <td className={cellClass}>{player.team}</td>
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
                            className={`${cellClass} bg-transparent`}
                            style={{ backgroundColor: bgColor }}
                          >
                            {col.render ? col.render(player) : value.toFixed(1)}
                          </td>
                        );
                      })}
                      <td className={cellClass}>{player.rating.toFixed(2) ?? 0}</td>
                    </tr>
                    {(id + 1) % 15 === 0 && (
                      <tr key={id}>
                        <th className={headerClass}>Rk</th>
                        <th className={`sticky left-0 ${headerClass}`}>Player</th>
                        <th className={headerClass}>Team</th>
                        <th className={headerClass}>GP</th>
                        {statColumns.map((col) => (
                          <th key={col.key} className={headerClass}>
                            {col.label}
                          </th>
                        ))}
                        <th className={headerClass}>Rating</th>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const headerClass = "border border-zinc-400 dark:border-zinc-800 px-2 py-1.5 sm:px-4 sm:py-2 text-left text-sm font-semibold bg-zinc-300 dark:bg-zinc-700"
const cellClass = "border border-zinc-400 dark:border-zinc-800 px-2 py-1 sm:px-4 sm:py-2 text-sm bg-zinc-100 dark:bg-zinc-900"