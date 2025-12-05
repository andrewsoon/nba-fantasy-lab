"use client"

import PlayersDataRaw from "@/data/players.json";
import { DatasetKeys } from "@/types/player";
import React from "react";
import Dropdown from "./Dropdown";
import PlayersHeatmap from "./PlayersHeatmap";

const datasetLabels: Record<DatasetKeys | string, string> = {
  season_avgs: "Season averages",
  season_totals: "Season totals",
  last7_avgs: "Last 7 days averages",
  last7_totals: "Last 7 days totals",
  last14_avgs: "Last 14 days averages",
  last14_totals: "Last 14 days totals"
}

export function PlayersHistoricStats() {
  const [dataset, setDataset] = React.useState<DatasetKeys>('season_avgs')

  return (
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
            onSelect={setDataset}
            selected={datasetLabels[dataset]}
          />
        </div>
        <PlayersHeatmap dataset={dataset} />
      </div>
    </div>
  )
}
