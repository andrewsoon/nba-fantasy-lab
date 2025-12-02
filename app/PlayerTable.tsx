"use client"

import { PlayerStats, PlayerStatsRaw } from "@/types/types"
import { computePlayerRatings, getHeatmapColor, StatsToUse } from "@/utils/compute"
import Image from "next/image"
import React from "react"

interface PlayersTableProps {
  players: PlayerStatsRaw[]
}
interface StatColumn {
  key: typeof StatsToUse[number],
  label: string,
  invert?: boolean,
  render?: (player: PlayerStats) => React.ReactNode,
}

const headerClass = "border border-gray-200 dark:border-gray-700 px-2 py-1.5 sm:px-4 sm:py-2 text-left text-sm font-semibold"
const cellClass = "border border-gray-200 dark:border-gray-700 px-2 py-1.5 sm:px-4 sm:py-2 text-sm"

const statColumns: StatColumn[] = [
  {
    key: "fg_pct_rating", label: "FG", render: (player: PlayerStats) => (
      <div className="flex gap-1">
        <p>{player.fg_pct}</p>
        <p className="text-xs">({player.fgm}/{player.fga})</p>
      </div>
    )
  },
  {
    key: "ft_pct_rating", label: "FT", render: (player: PlayerStats) => (
      <div className="flex gap-1">
        <p>{player.ft_pct}</p>
        <p className="text-xs">({player.ftm}/{player.fta})</p>
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

export const PlayersTable = ({ players }: PlayersTableProps) => {
  const [useSeasonAvg, setUseSeasonAvg] = React.useState(false)
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkQuery.matches);

    const listener = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkQuery.addEventListener('change', listener);

    return () => darkQuery.removeEventListener('change', listener);
  }, []);

  const sortPlayers = (playerStats: PlayerStats[], sort: string = 'last5') => {
    if (sort === 'last5') {
      return playerStats.sort((a, b) => b.last5_player_rating - a.last5_player_rating)
    }
    return playerStats.sort((a, b) => b.player_rating - a.player_rating)
  }

  const processedPlayers: PlayerStats[] = React.useMemo(() => {
    const processedPlayers = computePlayerRatings(players)
    const sortedPlayers = sortPlayers(processedPlayers, useSeasonAvg ? "" : "last5")
    return sortedPlayers
  }, [players, useSeasonAvg])

  const minMax: Record<typeof StatsToUse[number], { min: number; max: number }> = React.useMemo(() => {
    return StatsToUse.reduce((acc, stat) => {
      const vals: number[] = processedPlayers.map((p) => p[stat] ?? 0)
      acc[stat] = { min: Math.min(...vals), max: Math.max(...vals) }
      return acc
    }, {} as Record<typeof StatsToUse[number], { min: number; max: number }>)
  }, [processedPlayers])

  return (
    <div className="overflow-x-auto px-8 sm:px-12 md:px-15 pb-16">
      <button onClick={() => setUseSeasonAvg((prev) => !prev)}>{useSeasonAvg ? "Season Averages" : "Last 5 Games Averages"}</button>
      <table className="min-w-full border border-gray-200 dark:border-gray-700 ">
        <thead className="bg-zinc-100 dark:bg-zinc-800">
          <tr>
            <th className="">Rk</th>
            <th className={headerClass}>Player</th>
            <th className={headerClass}>Team</th>
            {useSeasonAvg && <th className={headerClass}>GP</th>}
            {statColumns.map((col) => (
              <th key={col.key} className={headerClass}>
                {col.label}
              </th>
            ))}
            <th className={headerClass}>Rating</th>
          </tr>
        </thead>
        <tbody>
          {processedPlayers.map((player, id) => {
            if (id > 199) return
            return (
              <React.Fragment key={`${id}-row`}>
                <tr key={`${player.id}-stats`}>
                  <td className={cellClass}>{id + 1}</td>
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
                  {useSeasonAvg && <td className={cellClass}>{player.games_played}</td>}
                  {statColumns.map((col) => {
                    const value = player[col.key] ?? 0;
                    const bgColor = getHeatmapColor(
                      value,
                      minMax[col.key as keyof typeof minMax].min,
                      minMax[col.key as keyof typeof minMax].max,
                      col.invert,
                      isDarkMode,
                    );

                    return (
                      <td
                        key={col.key}
                        className={`${cellClass} bg-transparent`}
                        style={{ backgroundColor: bgColor }}
                      >
                        {col.render ? col.render(player) : value}
                      </td>
                    );
                  })}
                  <td className={cellClass}>{useSeasonAvg ? player.player_rating.toFixed(2) : player.last5_player_rating.toFixed(2)}</td>
                </tr>
                {(id + 1) % 15 === 0 && (
                  <tr key={id} className="bg-zinc-100 dark:bg-zinc-800">
                    <th className={headerClass}>Rk</th>
                    <th className={headerClass}>Player</th>
                    <th className={headerClass}>Team</th>
                    {useSeasonAvg && <th className={headerClass}>GP</th>}
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