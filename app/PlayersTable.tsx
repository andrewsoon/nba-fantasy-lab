"use client"

import PlayersDataRaw from "@/data/players.json";
import { usePlayersData } from "@/hooks/usePlayersData";
import { CategoryColKeys, PlayerStatsKeys, StatCategory } from "@/types/player";
import { getHeatmapColor } from "@/utils/getHeatmapColor";
import Image from "next/image";
import React from "react";

interface StatColumn {
  key: CategoryColKeys,
  label: string,
  invert?: boolean,
  render?: (player: StatCategory) => React.ReactNode,
}

const statColumns: StatColumn[] = [
  {
    key: "fg_pct", label: "FG%", render: (cat: StatCategory) => (
      <div className="flex gap-1">
        <p>{cat.fg_pct.toFixed(3)}</p>
        <p className="text-xs">({cat.fgm.toFixed(1)}/{cat.fga.toFixed(1)})</p>
      </div>
    )
  },
  {
    key: "ft_pct", label: "FT%", render: (cat: StatCategory) => (
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

export function PlayersTable() {
  const { players: PlayersData, category_min_max: MinMax } = usePlayersData()
  const [statType, _setStatType] = React.useState<PlayerStatsKeys>('last14_avgs')
  const [useWeightedPct, _setUseWeightedPct] = React.useState<boolean>(false)
  const [isDarkMode, setIsDarkMode] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkQuery.matches);

    const listener = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkQuery.addEventListener('change', listener);

    return () => darkQuery.removeEventListener('change', listener);
  }, []);

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
    <div className="overflow-x-auto px-8 sm:px-12 md:px-15 pb-16">
      <div className="flex flex-row justify-end pb-1">
        <p className="text-xs">Last updated at: {new Date(PlayersDataRaw._meta.fetched_at).toLocaleString()}</p>
      </div>
      <table className="min-w-full border border-gray-200 dark:border-gray-700 ">
        <thead className="bg-zinc-100 dark:bg-zinc-800">
          <tr>
            <th className="">RK</th>
            <th className={headerClass}>Player</th>
            <th className={headerClass}>Team</th>
            <th className={headerClass}>GP</th>
            {statColumns.map((col) => (
              <th key={col.key} className={headerClass}>
                {col.label}
              </th>
            ))}
            <th className={headerClass}>Rating</th>
          </tr>
        </thead>
        <tbody>
          {PlayersData.sort((a, b) => (b[statType]?.rating ?? 0) - (a[statType]?.rating ?? 0)).map((player, id) => {
            if (id > 199) return

            const stats = player[statType]
            return (
              <React.Fragment key={`${id}-row`}>
                <tr key={`${player.id}-stats`}>
                  <td className={cellClass}>{stats.rank ?? '-'}</td>
                  <td className={`${cellClass} min-w-50`}>
                    <div className="flex flex-row items-center gap-2">
                      <Image
                        src={`https://cdn.nba.com/headshots/nba/latest/260x190/${player.id}.png`}
                        alt={`${player.id}-headshot`}
                        width={100} // original image width
                        height={100} // original image height
                        className="h-8 sm:h-10 w-auto"
                      />
                      <p>{player.name}</p>
                    </div>
                  </td>
                  <td className={cellClass}>{player.team}</td>
                  <td className={cellClass}>{stats.gp}</td>
                  {statColumns.map((col) => {
                    let value = stats[col.key] ?? 0;
                    let min = MinMax[statType][col.key].min
                    let max = MinMax[statType][col.key].max

                    if (col.key === 'fg_pct' && useWeightedPct) {
                      value = stats.fg_pct * stats.fga
                      min = MinMax[statType].fg_pct.weighted_min ?? 0
                      max = MinMax[statType].fg_pct.weighted_max ?? 0
                    }
                    if (col.key === 'ft_pct' && useWeightedPct) {
                      value = stats.ft_pct * stats.fta
                      min = MinMax[statType].ft_pct.weighted_min ?? 0
                      max = MinMax[statType].ft_pct.weighted_max ?? 0
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
                        className={`${cellClass} bg-transparent`}
                        style={{ backgroundColor: bgColor }}
                      >
                        {col.render ? col.render(stats) : value.toFixed(1)}
                      </td>
                    );
                  })}
                  <td className={cellClass}>{stats.rating?.toFixed(2) ?? 0}</td>
                </tr>
                {(id + 1) % 15 === 0 && (
                  <tr key={id} className="bg-zinc-100 dark:bg-zinc-800">
                    <th className={headerClass}>Rk</th>
                    <th className={headerClass}>Player</th>
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
  )
}

const headerClass = "border border-gray-200 dark:border-gray-700 px-2 py-1.5 sm:px-4 sm:py-2 text-left text-sm font-semibold"
const cellClass = "border border-gray-200 dark:border-gray-700 px-2 py-1.5 sm:px-4 sm:py-2 text-sm"