"use client"

import { useColorScheme } from "@/hooks/useColorScheme"
import { PlayerStats } from "@/types/types"
import { getHeatmapColor, StatsToUse } from "@/utils/compute"
import React from "react"

interface PlayersTableProps {
  players: PlayerStats[]
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
        <p>{player.fg_pct.toFixed(1)}</p>
        <p className="text-xs">({player.fgm}/{player.fga})</p>
      </div>
    )
  },
  {
    key: "ft_pct_rating", label: "FT", render: (player: PlayerStats) => (
      <div className="flex gap-1">
        <p>{player.ft_pct.toFixed(1)}</p>
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

  const isDark = useColorScheme()

  const minMax: Record<typeof StatsToUse[number], { min: number; max: number }> = React.useMemo(() => {
    return StatsToUse.reduce((acc, stat) => {
      const vals: number[] = players.map((p) => p[stat] ?? 0)
      acc[stat] = { min: Math.min(...vals), max: Math.max(...vals) }
      return acc
    }, {} as Record<typeof StatsToUse[number], { min: number; max: number }>)
  }, [players])

  return (
    <div className="overflow-x-auto px-8 sm:px-12 md:px-15 pb-16">
      <table className="min-w-full border border-gray-200 dark:border-gray-700 ">
        <thead className="bg-zinc-100 dark:bg-zinc-800">
          <tr>
            <th className="">Rk</th>
            <th className={headerClass}>Player</th>
            <th className={headerClass}>Team</th>
            <th className={headerClass}>GP</th>
            {statColumns.map((col) => (
              <th key={col.key} className={headerClass}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((player, id) => {
            if (id > 199) return
            return (
              <>
                <tr key={`${player.id}-stats`}>

                  <td className={cellClass}>{id + 1}</td>
                  <td className={`${cellClass} min-w-50`}>
                    <div className="flex flex-row items-center gap-2">
                      <img src={`https://cdn.nba.com/headshots/nba/latest/260x190/${player.id}.png`} alt={`${player.id}-headshot`} className="h-8 sm:h-10" />
                      <p>{player.name}</p>
                    </div>
                  </td>
                  <td className={cellClass}>{player.team}</td>
                  <td className={cellClass}>{player.games_played}</td>
                  {statColumns.map((col) => {
                    const value = player[col.key] ?? 0;
                    const bgColor = getHeatmapColor(
                      value,
                      minMax[col.key as keyof typeof minMax].min,
                      minMax[col.key as keyof typeof minMax].max,
                      col.invert,
                      isDark,
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
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}