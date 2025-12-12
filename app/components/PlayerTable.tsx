import { PlayerRow } from "@/hooks/usePlayersData"
import { PlayerSortProps } from "./PlayersHeatmap"
import React from "react"
import Checkbox from "./Checkbox"
import Image from "next/image"
import { STAT_KEYS, StatKeys } from "@/types/player"
import { getHeatmapColor, StatLabels } from "@/utils/playersTable"

interface PlayerTableProps {
  players: PlayerRow[]
  showZscore: boolean
  teamBuilderMode: boolean
  statWeights: Record<StatKeys, number>

  selectedPlayers: number[]
  onSelect: (e: React.ChangeEvent<HTMLInputElement>, value: number) => void

  sort: PlayerSortProps
  setSort: React.Dispatch<React.SetStateAction<PlayerSortProps>>
}

const PlayerTable: React.FC<PlayerTableProps> = ({ players, showZscore, teamBuilderMode, selectedPlayers, onSelect, sort, setSort, statWeights }) => {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkQuery.matches);

    const listener = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkQuery.addEventListener('change', listener);

    return () => darkQuery.removeEventListener('change', listener);
  }, []);

  return (
    <div className="overflow-x-auto rounded-sm">
      <table className="min-w-full">
        <thead>
          <tr className={headerRowClass}>
            {teamBuilderMode && <th className={headerClass}></th>}
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
              Rank
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
            {STAT_KEYS.map((statKey) => {
              if (statWeights[statKey] === 0) return
              return (
                <th key={statKey} className={`${headerClass} cursor-pointer`}
                  onClick={() =>
                    setSort((prev) => ({
                      ...prev,
                      sortBy: statKey,
                      isDesc: prev.sortBy !== statKey ? !(statKey === 'tov') : !prev.isDesc,
                    }))
                  }>
                  {StatLabels[statKey]}
                  {sort.sortBy === statKey && (
                    <span className="ml-1 text-xs">
                      {(!(statKey === 'tov') ? sort.isDesc : !sort.isDesc) ? "▼" : "▲"}
                    </span>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {players.map((player, id) => {
            return (
              <React.Fragment key={`${id}-row`}>
                <tr key={`${player.id}-stats`} className={`${id % 2 === 0 ? ' bg-zinc-200 dark:bg-zinc-800' : 'bg-zinc-100 dark:bg-zinc-900'}`}>
                  {teamBuilderMode &&
                    <td className={cellClass}>
                      <Checkbox label="" checked={selectedPlayers.includes(player.id)} onChange={(e) => onSelect(e, player.id)} disabled={selectedPlayers.length === 13 && !selectedPlayers.includes(player.id)} />
                    </td>
                  }
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
                  {STAT_KEYS.map((statKey) => {
                    if (statWeights[statKey] === 0) return
                    const value = player[statKey]
                    const statZScore = player[`${statKey}_zscore`];

                    let bgColor = getHeatmapColor(statZScore, isDarkMode, statKey)

                    if (statKey === 'fg_pct') {
                      bgColor = getHeatmapColor(value, isDarkMode, statKey)

                      return (
                        <td
                          key={statKey}
                          className={cellClass}
                          style={{ backgroundColor: bgColor }}
                        >
                          <div className="flex gap-1">
                            <p>{player.fg_pct.toFixed(3)}</p>
                            <p className="text-xs">({player.fgm.toFixed(1)}/{player.fga.toFixed(1)})</p>
                          </div>
                          {showZscore && <p className="text-xs">{player.fg_pct_zscore.toFixed(2)}</p>}
                        </td>
                      )
                    }

                    if (statKey === 'ft_pct') {
                      bgColor = getHeatmapColor(value, isDarkMode, statKey)

                      return (
                        <td
                          key={statKey}
                          className={cellClass}
                          style={{ backgroundColor: bgColor }}
                        >
                          <div className="flex gap-1">
                            <p>{player.ft_pct.toFixed(3)}</p>
                            <p className="text-xs">({player.ftm.toFixed(1)}/{player.fta.toFixed(1)})</p>
                          </div>
                          {showZscore && <p className="text-xs">{player.ft_pct_zscore.toFixed(2)}</p>}
                        </td>
                      )
                    }

                    return (
                      <td
                        key={statKey}
                        className={cellClass}
                        style={{ backgroundColor: bgColor }}
                      >
                        <div>
                          <p>{value.toFixed(1)}</p>
                          {showZscore && <p className="text-xs">{statZScore.toFixed(2)}</p>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                {(id + 1) % 15 === 0 && (
                  <tr key={id} className={headerRowClass}>
                    {teamBuilderMode && <th className={headerClass}></th>}
                    <th className={`sticky left-0 ${headerClass} bg-zinc-400 dark:bg-zinc-700 relative border-r-0`}>
                      Player
                      <span className="absolute top-0 right-0 h-full w-[3px] bg-zinc-500"></span>
                    </th>
                    <th className={`${headerClass} border-l-0`}>Team</th>
                    <th className={headerClass}>GP</th>
                    {STAT_KEYS.map((statKey) => {

                      if (statKey && statWeights[statKey] === 0) return
                      return (
                        <th key={statKey} className={headerClass}>
                          {StatLabels[statKey]}
                        </th>
                      )
                    })}
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
const headerRowClass = "text-left text-sm md:text-base text-zinc-100 font-semibold bg-zinc-400 dark:bg-zinc-700"
const cellClass = "border border-t-2 border-zinc-500 dark:border-zinc-600 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm md:text-base md:font-medium lg:text-lg transition-discrete"

export default PlayerTable