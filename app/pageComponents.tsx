"use client"

import { PlayerStats } from "@/types/types"

interface PlayersTableProps {
  players: PlayerStats[]
}
export const PlayersTable = ({ players }: PlayersTableProps) => {
  return (
    <div className="overflow-x-auto px-8 sm:px-12 md:px-15 pb-16">
      <table className="min-w-full border border-gray-200 dark:border-gray-700 ">
        <thead className="bg-zinc-100 dark:bg-zinc-800">
          <tr>
            <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">Rk</th>
            <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">Player</th>
            <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">Team</th>
            <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">GP</th>
            <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">FG%</th>
            <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">FT%</th>
            <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">3PM</th>
            <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">PTS</th>
            <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">AST</th>
            <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">REB</th>
            <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">STL</th>
            <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">BLK</th>
            <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">TOV</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, id) => {
            return (
              <>
                <tr key={`${player.id}-stats`}>
                  <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">{id + 1}</td>
                  <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">
                    <div className="flex flex-row items-center gap-2">
                      <img src={`https://cdn.nba.com/headshots/nba/latest/260x190/${player.id}.png`} alt={`${player.id}-headshot`} className="h-10" />
                      <p>{player.name}</p>
                    </div>
                  </td>
                  <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">{player.team}</td>
                  <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">{player.games_played}</td>
                  <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">
                    <div className="flex flex-row items-center gap-1 h-full">
                      <p>{player.fg_pct}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">({player.fgm}/{player.fga})</p>
                    </div>
                  </td>
                  <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">
                    <div className="flex flex-row items-center gap-1 h-full">
                      <p>{player.ft_pct}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">({player.ftm}/{player.fta})</p>
                    </div>
                  </td>
                  <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">{player.fg3m}</td>
                  <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">{player.pts}</td>
                  <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">{player.reb}</td>
                  <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">{player.ast}</td>
                  <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">{player.stl}</td>
                  <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">{player.blk}</td>
                  <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">{player.tov}</td>
                </tr>
                {(id + 1) % 15 === 0 && (
                  <tr key={id} className="bg-zinc-100 dark:bg-zinc-800">
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">Rk</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">Player</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">Team</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">GP</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">FG%</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">FT%</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">3PM</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">PTS</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">AST</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">REB</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">STL</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">BLK</th>
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">TOV</th>
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