"use client"
import { Tabs } from "@/components/Tabs";
import PlayersDataRaw from "@/data/players.json";
import { usePlayersData } from "@/hooks/usePlayersData";
import { DatasetKeys, StatKeys } from "@/types/player";
import { StatLabels } from "@/utils/playersTable";
import React from "react";
import Dropdown from "../../components/Dropdown";
import PlayerTable from "../../components/PlayerTable";

const datasetLabels: Record<DatasetKeys | string, string> = {
  last7_avgs: "Last 7 days averages",
  last7_totals: "Last 7 days totals",
  last14_avgs: "Last 14 days averages",
  last14_totals: "Last 14 days totals",
  season_avgs: "Season averages",
  season_totals: "Season totals",
}

interface StatWeightControls {
  statWeights: Record<StatKeys, number>
}

const statWeightKeys: StatKeys[] = ['pts', 'reb', 'ast', 'fg_pct', 'ft_pct', 'fg3m', 'stl', 'blk', 'tov']
const weightOptions = [4, 3, 2, 1, 0.5, 0.25, 0]

const defaultStatWeightControls: StatWeightControls = {
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

const minsPlayedOptions = [0, 5, 10, 15, 20, 25, 30]
const gamesPlayedOptions = [1, 3, 5, 10, 20, 30]
const posOptions = ['All', 'F', 'G', 'C']

const watchlistStorageKey = "nba_fantasy_watchlist"

interface StoredWatchlistStruct {
  players: number[]
}

export default function PlayersHeatmap() {
  const [dataset, setDataset] = React.useState<DatasetKeys>('season_avgs')
  const [statWeightControls, setStatWeightControls] = React.useState<StatWeightControls>(defaultStatWeightControls)
  const [minsPlayed, setMinsPlayed] = React.useState<number>(10)
  const [gamesPlayed, setGamesPlayed] = React.useState<number>(2)
  const [pos, setPos] = React.useState<string>('All')
  const [search, setSearch] = React.useState<string | undefined>(undefined)
  const [showZscore, setShowZscore] = React.useState<boolean>(false)
  const [watchlist, setWatchlist] = React.useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = JSON.parse(localStorage.getItem(watchlistStorageKey) || "{}") as StoredWatchlistStruct;
      return saved.players ?? [];
    } catch {
      return [];
    }
  });

  const { rows: playerRows, loading: processingPlayers } = usePlayersData(dataset, statWeightControls.statWeights, gamesPlayed, minsPlayed)

  const handleSelectPlayers = React.useCallback((e: React.ChangeEvent<HTMLInputElement>, value: number) => {
    setWatchlist((prev) => {
      let updatedArr = []
      if (e.target.checked) {
        updatedArr = [...prev, value]
      } else {
        updatedArr = prev.filter((p) => p !== value)
      }
      localStorage.setItem(watchlistStorageKey, JSON.stringify({ players: updatedArr }))
      return updatedArr
    });
  }, []);

  const handleSearch = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }, [])

  const filteredPlayersRows = React.useMemo(() => {
    let playerArr = [...playerRows]
    if (search) {
      playerArr = playerArr.filter((player) => player.name.toLowerCase().includes(search.toLowerCase()))
    }
    if (pos.toLowerCase() !== 'all') {
      playerArr = playerArr.filter((player) => player.position.includes(pos))
    }
    return playerArr
  }, [playerRows, search, pos])

  const watchListRows = React.useMemo(() => {
    return playerRows
      .filter(player => watchlist.includes(player.id)) // first, only players in watchlist
      .filter(player => {
        // Filter by search
        const matchesSearch = search
          ? player.name.toLowerCase().includes(search.toLowerCase())
          : true;

        // Filter by position
        const matchesPos =
          pos.toLowerCase() !== "all"
            ? player.position.toLowerCase().includes(pos.toLowerCase())
            : true;

        return matchesSearch && matchesPos;
      });
  }, [playerRows, watchlist, search, pos]);

  return (
    <div className="m-2 mb-20">
      {/* <div className="flex flex-col items-center py-5 sm:py-10 md:py-15 px-10 sm:px-14 md:px-20">
        <div className="flex flex-col items-center gap-2 sm:gap-4 text-center">
          <h3 className="text-base sm:text-4xl lg:text-5xl font-semibold text-zinc-700 dark:text-zinc-200">
            Player Heatmap
          </h3>
          <p className="text-sm sm:text-lg text-zinc-700 dark:text-zinc-300 max-w-250">
            Performance trends and category comparison
          </p>
        </div>
      </div> */}
      <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6 pt-2 bg-zinc-100 dark:bg-zinc-900 shadow-xl dark:shadow-none rounded-xl m-3">
        <div className={`${processingPlayers ? 'opacity-50 pointer-events-none h-200 overflow-y-hidden' : ''}`}>
          <div className="flex flex-col gap-2 sm:gap-3 w-full my-4">
            <div className="flex flex-row justify-center pb-1">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Last updated at: {new Date(PlayersDataRaw._meta.fetched_at).toISOString()}</p>
            </div>
            <div className="flex flex-row items-center justify-start overflow-x-auto xl:justify-center gap-2 md:gap-3 p-4 md:px-5 border-1 border-zinc-200 dark:border-zinc-800">
              <Dropdown
                label="Data from"
                dropdownClasses={{
                  label: 'text-xs md:text-sm',
                  button: 'min-w-50 p-x-1',
                }}
                options={Object.entries(datasetLabels).map(([value, label]) => {
                  return { label, value }
                })}
                onSelect={value => setDataset(value as DatasetKeys)}
                selected={datasetLabels[dataset]}
              />
              <Dropdown
                label="Z-score"
                dropdownClasses={{
                  label: 'text-xs md:text-sm',
                  button: 'min-w-1 p-x-1',
                }}
                options={[
                  {
                    label: 'Show',
                    value: true,
                  },
                  {
                    label: 'Hide',
                    value: false,
                  }
                ]}
                onSelect={value =>
                  setShowZscore(!!value)
                }
                selected={showZscore ? 'Show' : 'Hide'}
              />
              <Dropdown
                label="Mins Played"
                dropdownClasses={{
                  label: 'text-xs md:text-sm',
                  button: 'min-w-1 p-x-1',
                }}
                options={minsPlayedOptions.map((option) => {
                  return { label: `> ${option.toString()}`, value: option }
                })}
                onSelect={value =>
                  setMinsPlayed(value as number)
                }
                selected={`> ${minsPlayed.toString()}`}
              />
              <Dropdown
                label="Games Played"
                dropdownClasses={{
                  label: 'text-xs md:text-sm',
                  button: 'min-w-1 p-x-1',
                }}
                options={gamesPlayedOptions.map((option) => {
                  return { label: option.toString(), value: option }
                })}
                onSelect={value =>
                  setGamesPlayed(value as number)
                }
                selected={gamesPlayed.toString()}
              />
              <Dropdown
                label="Pos"
                dropdownClasses={{
                  label: 'text-xs md:text-sm',
                  button: 'min-w-1 p-x-1',
                }}
                options={posOptions.map((option) => {
                  return { label: option.toString(), value: option }
                })}
                onSelect={value =>
                  setPos(value as string)
                }
                selected={pos}
              />
            </div>
            <div className="flex flex-row items-center justify start overflow-x-auto xl:justify-center gap-2 md:gap-3 p-4 md:px-5 border-1 border-zinc-200 dark:border-zinc-800">
              {statWeightKeys.map((statKey) => {
                return (
                  <div className="flex justify-end" key={`${statKey}-dropdown`}>
                    <Dropdown
                      dropdownClasses={{
                        label: 'text-xs md:text-sm',
                        button: 'min-w-1 p-x-1',
                      }}
                      options={weightOptions.map((option) => {
                        return { label: `x${option.toString()}`, value: option }
                      })}
                      onSelect={value =>
                        setStatWeightControls(prev => ({
                          ...prev,
                          statWeights: {
                            ...prev.statWeights,
                            [statKey]: value as number
                          }
                        }))
                      }
                      selected={`${StatLabels[statKey]}  x${statWeightControls.statWeights[statKey].toString()}`}
                    />
                  </div>
                )
              })}
            </div>
          </div>
          <Tabs
            tabs={[
              {
                label: 'All Players',
                content: (
                  <PlayerTable
                    players={filteredPlayersRows}
                    showZscore={showZscore}
                    statWeights={statWeightControls.statWeights}

                    watchlist={watchlist}
                    onSelect={handleSelectPlayers}
                  />
                )
              }, {
                label: `Watchlist (${watchListRows.length})`,
                content: (
                  <PlayerTable
                    players={watchListRows}
                    showZscore={showZscore}
                    statWeights={statWeightControls.statWeights}

                    watchlist={watchlist}
                    onSelect={handleSelectPlayers}
                  />
                )
              }
            ]}
            labelEndComponent={
              <input
                type="text"
                className="
                    w-30 sm:w-50 px-2 py-1 sm:px-4 sm:py-2 mb-2
                    rounded-lg border border-zinc-300 dark:border-zinc-600
                    bg-white dark:bg-zinc-800
                    text-zinc-800 dark:text-zinc-200
                    placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                    placeholder:text-xs placeholder:sm:text-sm
                    focus:outline-none focus:ring-1 focus:ring-zinc-500
                    transition-all duration-150
                  "
                placeholder="Search..."
                onChange={handleSearch}
              />
            }
          />

        </div>
        {
          processingPlayers && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-900/50">
              <div className="animate-spin rounded-full border-4 border-zinc-300 border-t-transparent h-12 w-12" />
            </div>
          )
        }
      </div >
    </div >
  )
}
