import PlayersData from "@/data/players.json";
import { DatasetKeys, Player, StatCategory } from "@/types/player";
import React from "react";

export function usePlayersData(selectedDataSet: DatasetKeys) {
  const playersRaw = PlayersData.players;

  const [rows, setRows] = React.useState<PlayerRow[]>([]);
  const [minMax, setMinMax] = React.useState<Record<string, { min: number; max: number }>>({});
  const [loading, setLoading] = React.useState(true);

  // preprocess raw data once
  const basePlayers: Player[] = React.useMemo(() =>
    playersRaw.map(p => ({
      ...p,
      season_totals: toStatCategory(p.season_totals, p.season_totals.gp),
      season_avgs: toStatCategory(p.season_avgs, p.season_totals.gp),
      last7_totals: toStatCategory(p.last7_totals, p.last7_totals.gp),
      last7_avgs: toStatCategory(p.last7_avgs, p.last7_totals.gp),
      last14_totals: toStatCategory(p.last14_totals, p.last14_totals.gp),
      last14_avgs: toStatCategory(p.last14_avgs, p.last14_totals.gp),
    }))
    , [playersRaw]);

  // compute rows/minMax when dataset changes
  React.useEffect(() => {
    setLoading(true);

    // schedule computation so React can render spinner
    setTimeout(() => {
      const newRows = basePlayers.map(p => flattenPlayer(p, selectedDataSet));
      const newMinMax = computeMinMax(newRows);
      const datasetMeanStd = computeDatasetMeanStd(newRows);

      newRows.forEach(row => computePlayerRating(row, datasetMeanStd));
      assignRanks(newRows);
      newRows.sort((a, b) => b.rating - a.rating);

      setRows(newRows);
      setMinMax(newMinMax);
      setLoading(false);
    }, 0);

  }, [selectedDataSet, basePlayers]);

  return { rows, minMax, loading };
}


function toStatCategory(raw: Partial<StatCategory>, totalsGP?: number): StatCategory {
  const fg_pct = raw.fga ? raw.fgm! / raw.fga : 0;
  const ft_pct = raw.fta ? raw.ftm! / raw.fta : 0;

  return {
    min: raw.min ?? 0,
    pts: raw.pts ?? 0,
    reb: raw.reb ?? 0,
    ast: raw.ast ?? 0,
    stl: raw.stl ?? 0,
    blk: raw.blk ?? 0,
    tov: raw.tov ?? 0,
    fgm: raw.fgm ?? 0,
    fga: raw.fga ?? 0,
    ftm: raw.ftm ?? 0,
    fta: raw.fta ?? 0,
    fg3m: raw.fg3m ?? 0,
    fg3a: raw.fg3a ?? 0,
    fg_pct,
    ft_pct,
    gp: totalsGP ?? raw.gp ?? 0,
    fg_weighted: fg_pct * (raw.fga ?? 0),
    ft_weighted: ft_pct * (raw.fta ?? 0),
  };
}

export interface PlayerRow {
  id: number,
  name: string,
  team_id: number,
  team: string,
  min: number,
  pts: number,
  reb: number,
  ast: number,
  stl: number,
  blk: number,
  tov: number,
  fgm: number,
  fga: number,
  ftm: number,
  fta: number,
  fg3m: number,
  fg3a: number,
  fg_pct: number,
  ft_pct: number,
  gp: number,
  rating: number,
  rank: number,

  fg_weighted: number;   // fg_pct * fga
  ft_weighted: number;   // ft_pct * fta
}
export type PlayerRowKeys = keyof PlayerRow;


function flattenPlayer(player: Player, key: DatasetKeys): PlayerRow {
  const selectedDataSet = player[key];

  return {
    id: player.id,
    name: player.name,
    team: player.team,
    team_id: player.team_id,
    ...selectedDataSet,
    rating: 0,
    rank: 0,
  };
}

function computeMinMax(rows: PlayerRow[]) {
  const result: Record<string, { min: number; max: number }> = {};

  const numericKeys = Object.keys(rows[0]).filter(k => typeof (rows[0] as any)[k] === "number");

  numericKeys.forEach(k => {
    const values = rows.map(r => (r as any)[k] as number);
    result[k] = {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  });

  return result;
}

type DatasetMeanStd = Record<keyof PlayerRow, { mean: number; std: number }>;

export function computeDatasetMeanStd(rows: PlayerRow[]): Partial<DatasetMeanStd> {
  const datasetMeanStd: Partial<DatasetMeanStd> = {};

  // Get all numeric keys from the first row
  const numericKeys = Object.keys(rows[0]).filter(
    k => typeof (rows[0] as any)[k] === "number" && k !== "rating" && k !== "rank"
  ) as (keyof PlayerRow)[];

  numericKeys.forEach(k => {
    const values = rows.map(r => (r as any)[k] as number);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const std = Math.sqrt(
      values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length
    );

    datasetMeanStd[k] = { mean, std };
  });

  return datasetMeanStd;
}

function computePlayerRating(row: PlayerRow, datasetMeanStd: Partial<DatasetMeanStd>) {
  let zScore = 0;

  for (const key of Object.keys(datasetMeanStd) as (keyof StatCategory)[]) {
    if (key === "gp") continue; // skip games played

    const val = row[key] ?? 0;
    const { mean = 0, std = 1 } = datasetMeanStd[key] ?? {};

    if (std === 0) continue; // avoid division by zero

    // example: weight TOV negatively
    if (key === "tov") {
      zScore -= ((val - mean) * 0.25) / std;
    } else {
      zScore += (val - mean) / std;
    }
  }

  row.rating = zScore;
}

function assignRanks(rows: PlayerRow[]) {
  // Sort descending by rating
  const sorted = [...rows].sort((a, b) => b?.rating - a?.rating);

  let lastRating = Infinity;
  let rank = 0;

  sorted.forEach((player, i) => {
    // Only update rank if rating changed
    if (player.rating !== lastRating) {
      rank = i + 1;
      lastRating = player.rating;
    }
    player.rank = rank;
  });
}
