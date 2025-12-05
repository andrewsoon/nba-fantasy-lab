import { PlayerRow, PlayerRowKeys, usePlayersData } from "@/hooks/usePlayersData";
import { DatasetKeys, STAT_KEYS, StatKeys } from "@/types/player";
import { getHeatmapColor, StatLabels } from "@/utils/playersTable";
import Image from "next/image";
import React from "react";
import Dropdown from "./Dropdown";
import { RadialButtonGroup } from "./RadialButton";

interface PlayersHeatmapProps {
  dataset: DatasetKeys,
}

interface HeatmapControls {
  computeRankBy: 'zscore' | 'percentiles'
  statWeights: Record<StatKeys, number>
}

const computeOptions = [
  {
    label: 'Percentiles',
    value: 'percentiles',
  },
  {
    label: 'Z-score',
    value: 'zscore'
  }
]

const statWeightKeys: StatKeys[] = ['pts', 'reb', 'ast', 'fg_pct', 'ft_pct', 'fg3m', 'stl', 'blk', 'tov']
const weightOptions = [4, 3, 2, 1, 0.5, 0.25, 0]

const defaultHeatmapControls: HeatmapControls = {
  computeRankBy: 'percentiles',
  statWeights: {
    pts: 1,
    reb: 1,
    ast: 1,
    fg3m: 1,
    ft_pct: 1,
    fg_pct: 1,
    tov: 0.25,
    stl: 1,
    blk: 1,
  }
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
    key: "fg_pct", label: StatLabels.fg_pct, render: (statCol: PlayerRow) => (
      <div className="flex gap-1">
        <p>{statCol.fg_pct.toFixed(3)}</p>
        <p className="text-xs">({statCol.fgm.toFixed(1)}/{statCol.fga.toFixed(1)})</p>
      </div>
    )
  },
  {
    key: "ft_pct", label: StatLabels.ft_pct, render: (statCol: PlayerRow) => (
      <div className="flex gap-1">
        <p>{statCol.ft_pct.toFixed(3)}</p>
        <p className="text-xs">({statCol.ftm.toFixed(1)}/{statCol.fta.toFixed(1)})</p>
      </div>
    )
  },
  { key: "fg3m", label: StatLabels.fg3m },
  { key: "pts", label: StatLabels.pts },
  { key: "reb", label: StatLabels.reb },
  { key: "ast", label: StatLabels.ast },
  { key: "stl", label: StatLabels.stl },
  { key: "blk", label: StatLabels.blk },
  { key: "tov", label: StatLabels.tov, invert: true },
];

export default function PlayersHeatmap({ dataset }: PlayersHeatmapProps) {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean | undefined>(undefined);
  const [sort, setSort] = React.useState<SortProps>({ sortBy: 'rank', isDesc: false })
  const [heatmapControls, setHeatmapControls] = React.useState<HeatmapControls>(defaultHeatmapControls)

  const { rows: playerRows, minMax, loading: processingPlayers } = usePlayersData(dataset, heatmapControls.statWeights, heatmapControls.computeRankBy === 'zscore')

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
    <div className="relative">
      <div className={`${isLoading ? 'opacity-50 pointer-events-none h-200 overflow-y-hidden' : ''}`}>
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 w-full my-4 p-2 border-1 border-zinc-200 dark:border-zinc-800 p-2 md:py-4  md:px-5">
          <RadialButtonGroup options={computeOptions} selected={heatmapControls.computeRankBy} onChange={value => {
            setHeatmapControls(prev => ({
              ...prev,
              computeRankBy: value,
            }))
          }} />
          <div className="flex flex-row flex-wrap gap-2">
            {statWeightKeys.map((statKey) => {
              return (
                <div className="flex justify-end">
                  <Dropdown
                    label={StatLabels[statKey]}
                    dropdownClasses={{
                      label: 'text-xs md:text-sm',
                      button: 'min-w-1 p-x-1',
                    }}
                    options={weightOptions.map((option) => {
                      return { label: `x${option.toString()}`, value: option }
                    })}
                    onSelect={value =>
                      setHeatmapControls(prev => ({
                        ...prev,
                        statWeights: {
                          ...prev.statWeights,
                          [statKey]: value
                        }
                      }))
                    }
                    selected={`x${heatmapControls.statWeights[statKey].toString()}`}
                  />
                </div>
              )
            })}
          </div>
        </div>
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
                {statColumns.map((col) => {
                  const statKey = STAT_KEYS.find((key) => key === col.key)
                  if (statKey && heatmapControls.statWeights[statKey] === 0) return
                  return (
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
                  )
                })}
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
                        const statKey = STAT_KEYS.find((key) => key === col.key)
                        if (!statKey || heatmapControls.statWeights[statKey] === 0) return
                        const value = player[statKey]
                        const percentileValue = player[`${statKey}_percentile`];

                        let bgColor = getHeatmapColor(percentileValue, 0, 1, col.invert, isDarkMode)
                        if (heatmapControls.computeRankBy === 'zscore') {
                          const min = minMax[statKey].min
                          const max = minMax[statKey].max
                          bgColor = getHeatmapColor(
                            value,
                            min,
                            max,
                            col.invert,
                            isDarkMode,
                            false
                          );
                        }

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
                        {statColumns.map((col) => {
                          const statKey = STAT_KEYS.find((key) => key === col.key)
                          if (statKey && heatmapControls.statWeights[statKey] === 0) return
                          return (
                            <th key={col.key} className={headerClass}>
                              {col.label}
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
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-900/50">
          <div className="animate-spin rounded-full border-4 border-zinc-300 border-t-transparent h-12 w-12" />
        </div>
      )}
    </div>
  )
}

const headerClass = "border border-2 border-zinc-500 dark:border-zinc-500 px-2 py-1.5 sm:px-4 sm:py-2"
const headerRowClass = "text-left text-sm md:text-md text-zinc-100 font-semibold bg-zinc-400 dark:bg-zinc-700"
const cellClass = "border border-t-2 border-zinc-500 dark:border-zinc-600 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm md:text-md md:font-medium lg:text-lg"