"use client"

import PlayersDataRaw from "@/data/players.json";
import { PlayerRowKeys, usePlayersData } from "@/hooks/usePlayersData";
import { useToast } from "@/hooks/useToast";
import { DatasetKeys, StatKeys } from "@/types/player";
import { StatLabels } from "@/utils/playersTable";
import { useRouter } from "next/navigation";
import React from "react";
import Button from "./Button";
import Dropdown from "./Dropdown";
import Modal from "./Modal";
import PlayerTable from "./PlayerTable";
import { ToastContainer } from "./ToastContainer";
import Toggle from "./Toggle";

const datasetLabels: Record<DatasetKeys | string, string> = {
  season_avgs: "Season averages",
  season_totals: "Season totals",
  last7_avgs: "Last 7 days averages",
  last7_totals: "Last 7 days totals",
  last14_avgs: "Last 14 days averages",
  last14_totals: "Last 14 days totals"
}

interface HeatmapControls {
  statWeights: Record<StatKeys, number>
}

const statWeightKeys: StatKeys[] = ['pts', 'reb', 'ast', 'fg_pct', 'ft_pct', 'fg3m', 'stl', 'blk', 'tov']
const weightOptions = [4, 3, 2, 1, 0.5, 0.25, 0]

const defaultHeatmapControls: HeatmapControls = {
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

const teamsLocalStorageKey = "nba_fantasy_teams"

interface StoredTeamStruct {
  teamName: string,
  players: number[]
}

export interface PlayerSortProps {
  sortBy: PlayerRowKeys,
  isDesc: boolean
}

export default function PlayersHeatmap() {
  const router = useRouter()
  const [dataset, setDataset] = React.useState<DatasetKeys>('season_avgs')
  const [sort, setSort] = React.useState<PlayerSortProps>({ sortBy: 'rank', isDesc: false })
  const [heatmapControls, setHeatmapControls] = React.useState<HeatmapControls>(defaultHeatmapControls)
  const [search, setSearch] = React.useState<string | undefined>(undefined)
  const [hideLowRatings, setHideLowRatings] = React.useState<boolean>(true)
  const [showZscore, setShowZscore] = React.useState<boolean>(false)
  const [teamBuilderMode, setTeamBuilderMode] = React.useState<boolean>(false)
  const [selectedPlayers, setSelectedPlayers] = React.useState<number[]>([])
  const [openSaveTeam, setOpenSaveTeam] = React.useState<boolean>(false)
  const [teamName, setTeamName] = React.useState("")

  const { rows: playerRows, loading: processingPlayers } = usePlayersData(dataset, heatmapControls.statWeights)
  const { toasts, showToast } = useToast()

  const handleSelectPlayers = (e: React.ChangeEvent<HTMLInputElement>, value: number) => {
    setSelectedPlayers((prev) =>
      e.target.checked ? [...prev, value] : prev.filter((p) => p !== value)
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleSetTeamName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamName(e.target.value)
  }

  const handleSavePlayers = () => {
    const existing = JSON.parse(localStorage.getItem(teamsLocalStorageKey) || "[]") as StoredTeamStruct[]

    // Remove any old version of this team
    const withoutDuplicate = existing.filter(
      (t) => t.teamName !== teamName
    );

    // Add new team
    const updated = [
      ...withoutDuplicate,
      { teamName, players: selectedPlayers }
    ];

    localStorage.setItem(teamsLocalStorageKey, JSON.stringify(updated))

    setTeamName("")
    setOpenSaveTeam(false)
    showToast("Team saved successfully!")
  }

  const filterPlayers = React.useMemo(() => {
    let playerArr = [...playerRows]
    if (search) {
      playerArr = playerArr.filter((player) => player.name.toLowerCase().includes(search.toLowerCase()))
    }
    if (hideLowRatings) {
      playerArr = playerArr.filter((player) => player.rank <= 200)
    }

    return playerArr
  }, [playerRows, search, hideLowRatings])

  const sortedPlayerRows = React.useMemo(() => {
    return [...filterPlayers].sort((a, b) => {
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
  }, [filterPlayers, sort]);

  const isLoading = React.useMemo(() => {
    return processingPlayers
  }, [processingPlayers])


  return (
    <div className={"m-2"}>
      <div className="flex flex-col items-center py-5 sm:py-10 md:py-15 px-10 sm:px-14 md:px-20">
        <div className="flex flex-col items-center gap-2 sm:gap-4 text-center">
          <h3 className="text-base sm:text-4xl lg:text-5xl font-semibold text-zinc-700 dark:text-zinc-200">
            Master the Game with Heatmaps
          </h3>
          <p className="text-sm sm:text-lg text-zinc-700 dark:text-zinc-300 max-w-250">
            Explore performance trends, compare categories, and make data-driven decisions.
          </p>
        </div>
      </div>
      <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6 pt-2 bg-zinc-100 dark:bg-zinc-900 shadow-xl dark:shadow-none rounded-xl m-3">
        <div className="flex flex-row justify-center pb-1">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">Last updated at: {new Date(PlayersDataRaw._meta.fetched_at).toISOString()}</p>
        </div>
        <div className="px-4 py-4 rounded-md">
          <div className="px-1 pt-0 pb-2 sm:px-4 sm:pb-5 flex flex-col items-center justify-center">
            <Dropdown
              label="Data from"
              dropdownClasses={{
                label: 'text-sm md:text-lg',
                button: 'min-w-50 sm:min-w-100 md:text-lg',
              }}
              options={Object.entries(datasetLabels).map(([value, label]) => {
                return { label, value }
              })}
              onSelect={value => setDataset(value as DatasetKeys)}
              selected={datasetLabels[dataset]}
            />
          </div>
          <div className="relative">
            <div className={`${isLoading ? 'opacity-50 pointer-events-none h-200 overflow-y-hidden' : ''}`}>
              <div className="flex flex-col gap-2 sm:gap-3 w-full my-4">
                <div className="flex flex-row flex-wrap items-center justify-center gap-3 md:gap-6 p-4 md:py-4 md:px-5 border-1 border-zinc-200 dark:border-zinc-800">
                  <div className="flex flex-row items-center gap-6 md:gap-12">
                    <input
                      type="text"
                      className="
                        w-60 px-4 py-2
                        rounded-lg border border-zinc-300 dark:border-zinc-600
                        bg-white dark:bg-zinc-800
                        text-zinc-800 dark:text-zinc-200
                        placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                        focus:outline-none focus:ring-2 focus:ring-amber-500
                        transition-all duration-150
                      "
                      placeholder="Search..."
                      onChange={handleSearch}
                    />
                    {search && <button className="font-semibold hover:text-zinc-800 dark:hover:text-zinc-300 cursor-pointer" onClick={() => setSearch(undefined)}>Clear</button>}
                  </div>
                  <div className="flex flex-row items-center flex-wrap gap-3 md:gap-6">
                    <Toggle label="Show top 200 players only" enabled={hideLowRatings} onChange={setHideLowRatings} />
                    <Toggle label="Show z-score" onChange={setShowZscore} enabled={showZscore} />
                    <Toggle label="Team Builder Mode" onChange={setTeamBuilderMode} enabled={teamBuilderMode} />
                  </div>

                </div>
                <div className="flex flex-row items-center justify-center flex-wrap gap-3 md:gap-6 p-4 md:px-5 border-1 border-zinc-200 dark:border-zinc-800">
                  <p>Stat Weights</p>
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
                            setHeatmapControls(prev => ({
                              ...prev,
                              statWeights: {
                                ...prev.statWeights,
                                [statKey]: value as number
                              }
                            }))
                          }
                          selected={`${StatLabels[statKey]}  x${heatmapControls.statWeights[statKey].toString()}`}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
              {teamBuilderMode && (
                <div className="py-2 px-4 md:py-12 md:px-12 md:my-14 bg-zinc-300 dark:bg-zinc-800 transition-discrete">
                  <div className="flex flex-col items-start justify-start">
                    <p className="text-lg md:text-xl font-semibold">Team Builder Mode</p>
                    <ol className="list-decimal pl-5 text-base md:text-lg space-y-1 text-zinc-800 dark:text-zinc-300">
                      <li>Select your players &ndash; pick up to 13 players from the heatmap to build a full roster, or just a few to simulate trades.</li>
                      <li>Save your picks &ndash; lock in your selection for easy reference later.</li>
                      <li>
                        Analyze & compare &ndash; check weekly projected stats using the&nbsp;
                        <button className="hover:text-zinc-800 dark:hover:text-zinc-300 underline cursor-pointer" onClick={() => router.push('/compare')}>
                          Compare Teams
                        </button>&nbsp;tool to see how lineups or trade scenarios stack up.
                      </li>
                    </ol>
                  </div>
                  <div className="flex flex-row justify-end gap-3 md:gap-6 my-4">
                    <Button variant="outlined" onClick={() => setOpenSaveTeam(true)}>✅ Save</Button>
                    <Button variant="outlined" onClick={() => setSelectedPlayers([])}>❌ Clear</Button>
                  </div>
                  <PlayerTable
                    players={sortedPlayerRows.filter((p) => selectedPlayers.includes(p.id))}
                    showZscore={showZscore}
                    teamBuilderMode={teamBuilderMode}
                    statWeights={heatmapControls.statWeights}

                    selectedPlayers={selectedPlayers}
                    onSelect={handleSelectPlayers}

                    sort={sort}
                    setSort={setSort}
                  />
                </div>
              )}
              <PlayerTable
                players={sortedPlayerRows}
                showZscore={showZscore}
                teamBuilderMode={teamBuilderMode}
                statWeights={heatmapControls.statWeights}

                selectedPlayers={selectedPlayers}
                onSelect={handleSelectPlayers}

                sort={sort}
                setSort={setSort}
              />
            </div>
            {
              isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-900/50">
                  <div className="animate-spin rounded-full border-4 border-zinc-300 border-t-transparent h-12 w-12" />
                </div>
              )
            }

            {teamBuilderMode && (
              <div className="
                fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2
                bg-zinc-300 dark:bg-zinc-600 text-white
                px-4 py-2 rounded-full shadow-lg
                text-sm font-medium
                z-50
              ">
                Selected Players: {selectedPlayers.length} / 13
              </div>
            )}
            <Modal
              open={openSaveTeam}
              onClose={() => {
                setTeamName("")
                setOpenSaveTeam(false)
              }}
              title="Save Selected Players"
              onSubmit={handleSavePlayers}
              submitDisabled={teamName === ''}
            >
              <div className="flex flex-row items-center gap-3 p-2 md:p-4">
                Save players as:
                <input
                  type="text"
                  className="
                w-60 px-4 py-2
                rounded-lg border border-zinc-300 dark:border-zinc-600
                bg-white dark:bg-zinc-800
                text-zinc-800 dark:text-zinc-200
                placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                focus:outline-none focus:ring-2 focus:ring-amber-500
                transition-all duration-150
              "
                  placeholder={teamName}
                  onChange={handleSetTeamName}
                />
              </div>
            </Modal>
            <ToastContainer toasts={toasts} />
          </div>
        </div>
      </div>
    </div>
  )
}
