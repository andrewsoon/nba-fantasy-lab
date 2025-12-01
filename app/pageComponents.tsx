"use client"

import { PlayerStats } from "@/types/types"

interface PlayersTableProps {
  players: PlayerStats[]
}
export const PlayersTable = ({ players }: PlayersTableProps) => {
  return (
    <div className="overflow-x-auto px-8 sm:px-12 md:px-15 pb-16">
      <table className="min-w-full border ">
        <thead className="bg-zinc-100 dark:bg-zinc-800">
          <tr>
            <th className="border px-4 py-2 text-left text-sm font-semibold">Player</th>
            <th className="border px-4 py-2 text-left text-sm font-semibold">FG%</th>
            <th className="border px-4 py-2 text-left text-sm font-semibold">FT%</th>
            <th className="border px-4 py-2 text-left text-sm font-semibold">3PM</th>
            <th className="border px-4 py-2 text-left text-sm font-semibold">PTS</th>
            <th className="border px-4 py-2 text-left text-sm font-semibold">AST</th>
            <th className="border px-4 py-2 text-left text-sm font-semibold">REB</th>
            <th className="border px-4 py-2 text-left text-sm font-semibold">STL</th>
            <th className="border px-4 py-2 text-left text-sm font-semibold">BLK</th>
            <th className="border px-4 py-2 text-left text-sm font-semibold">TOV</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            return (
              <tr key={`${player.id}-stats`}>
                <td className="border px-4 py-2 text-sm">{player.name}</td>
                <td className="border px-4 py-2 text-sm">{player.fg_pct}</td>
                <td className="border px-4 py-2 text-sm">{player.ft_pct}</td>
                <td className="border px-4 py-2 text-sm">{player.fg3m}</td>
                <td className="border px-4 py-2 text-sm">{player.pts}</td>
                <td className="border px-4 py-2 text-sm">{player.reb}</td>
                <td className="border px-4 py-2 text-sm">{player.ast}</td>
                <td className="border px-4 py-2 text-sm">{player.stl}</td>
                <td className="border px-4 py-2 text-sm">{player.blk}</td>
                <td className="border px-4 py-2 text-sm">{player.tov}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}