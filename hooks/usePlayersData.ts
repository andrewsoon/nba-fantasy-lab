import PlayersData from "@/data/players.json";
import { DatasetKeys, Player, STAT_KEYS, StatCategory, StatKeys } from "@/types/player";
import React from "react";

export function usePlayersData(selectedDataSet: DatasetKeys, statWeights: Record<StatKeys, number>) {
  const playersRaw = PlayersData.players;

  const [rows, setRows] = React.useState<PlayerRow[]>([]);
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

      attachPercentiles(newRows)
      computePercentileRatings(newRows, statWeights)

      assignRanks(newRows);
      newRows.sort((a, b) => b.rating - a.rating);

      setRows(newRows);
      setLoading(false);
    }, 0);

  }, [selectedDataSet, basePlayers, statWeights]);

  const datasetMeanStd = computeDatasetMeanStd(rows)

  return { rows, loading, datasetMeanStd };
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

    pts_percentile: 0,
    reb_percentile: 0,
    ast_percentile: 0,
    stl_percentile: 0,
    blk_percentile: 0,
    fg3m_percentile: 0,
    fg_pct_percentile: 0,
    ft_pct_percentile: 0,
    tov_percentile: 0,
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

  pts_percentile: number,
  reb_percentile: number,
  ast_percentile: number,
  stl_percentile: number,
  blk_percentile: number,
  fg3m_percentile: number,
  fg_pct_percentile: number,
  ft_pct_percentile: number,
  tov_percentile: number,
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

type DatasetMeanStd = Record<keyof PlayerRow | 'fg_impact' | 'ft_impact', { mean: number; std: number }>;

function computeDatasetMeanStd(rows: PlayerRow[]): Partial<DatasetMeanStd> {
  const datasetMeanStd: Partial<DatasetMeanStd> = {};

  // Precompute league averages
  const totalFGA = rows.reduce((sum, r) => sum + (r.fga ?? 0), 0);
  const totalFGM = rows.reduce((sum, r) => sum + (r.fgm ?? 0), 0);
  const leagueFG = totalFGA > 0 ? totalFGM / totalFGA : 0;

  const totalFTA = rows.reduce((sum, r) => sum + (r.fta ?? 0), 0);
  const totalFTM = rows.reduce((sum, r) => sum + (r.ftm ?? 0), 0);
  const leagueFT = totalFTA > 0 ? totalFTM / totalFTA : 0;

  for (const key of STAT_KEYS) {
    // extract values for this stat
    let values: number[] = [];

    if (key === "fg_pct") {
      // FG impact
      datasetMeanStd['fg_pct'] = { mean: leagueFG, std: 0 }
      // Compute FG impact per player
      values = rows.map(r => ((r.fg_pct ?? 0) - leagueFG) * (r.fga ?? 0));
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const std = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length);

      datasetMeanStd['fg_impact'] = { mean, std };
    } else if (key === "ft_pct") {
      // Store raw FT% mean as leagueFT
      datasetMeanStd['ft_pct'] = { mean: leagueFT, std: 0 };

      // Compute FT impact per player
      values = rows.map(r => ((r.ft_pct ?? 0) - leagueFT) * (r.fta ?? 0));
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const std = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length);

      datasetMeanStd['ft_impact'] = { mean, std };
    } else {
      // normal stats
      // Normal stats
      values = rows.map(r => r[key] ?? 0);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const std = Math.sqrt(values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length);

      datasetMeanStd[key] = { mean, std };
    }
  }

  return datasetMeanStd;
}

function attachPercentiles(
  players: PlayerRow[]
) {
  STAT_KEYS.forEach((k) => {
    const values = players.map((p) => p[k] as number);

    const sorted = [...values].sort((a, b) => a - b);

    players.forEach((p, i) => {
      const v = p[k] as number;
      const rank = sorted.filter((x) => x <= v).length - 1;
      const pct = rank / (sorted.length - 1); // 0–1 percentile
      p[`${k}_percentile`] = pct;
    });
  });;
}

function computePercentileRatings(
  players: PlayerRow[],
  weights: Record<string, number> = {}
) {
  players.forEach((p) => {
    let totalWeight = 0;
    let sum = 0;

    STAT_KEYS.forEach((k) => {
      const key = `${k}_percentile` as keyof PlayerRow
      const pct = p[key] ?? 0; // treat missing percentiles as 0
      console
      const w = weights[k] ?? 1;
      if (typeof pct === 'number') {
        sum += pct * w;
        totalWeight += w;
      }
    });

    const rating = totalWeight > 0 ? sum / totalWeight : 0;
    p.rating = rating
  });
}


function assignRanks(rows: PlayerRow[]) {
  // Sort descending by rating
  const sorted = [...rows].sort((a, b) => b.rating - a.rating);

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
