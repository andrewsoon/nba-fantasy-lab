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

  // compute rows when dataset changes
  React.useEffect(() => {
    setLoading(true);

    // schedule computation so React can render spinner
    setTimeout(() => {
      const newRows = basePlayers.map(p => flattenPlayer(p, selectedDataSet));

      attachZScores(newRows)
      computeZScoreRatings(newRows, statWeights)

      assignRanks(newRows);
      newRows.sort((a, b) => b.rating - a.rating);

      setRows(newRows);
      setLoading(false);
    }, 0);

  }, [selectedDataSet, basePlayers, statWeights]);

  return { rows, loading };
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

    pts_zscore: 0,
    reb_zscore: 0,
    ast_zscore: 0,
    stl_zscore: 0,
    blk_zscore: 0,
    fg3m_zscore: 0,
    fg_pct_zscore: 0,
    ft_pct_zscore: 0,
    tov_zscore: 0,
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

  pts_zscore: number,
  reb_zscore: number,
  ast_zscore: number,
  stl_zscore: number,
  blk_zscore: number,
  fg3m_zscore: number,
  fg_pct_zscore: number,
  ft_pct_zscore: number,
  tov_zscore: number,
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

function attachZScores(
  players: PlayerRow[]
) {
  const ZERO_INFLATED = ["stl", "blk", "tpm"];
  const TURNOVER = "tov";

  // Compute league totals needed for FG% / FT% impact
  const totalFGA = players.reduce((s, p) => s + (p.fga ?? 0), 0);
  const totalFGM = players.reduce((s, p) => s + (p.fgm ?? 0), 0);
  const leagueFgPct = totalFGA === 0 ? 0 : totalFGM / totalFGA;

  const totalFTA = players.reduce((s, p) => s + (p.fta ?? 0), 0);
  const totalFTM = players.reduce((s, p) => s + (p.ftm ?? 0), 0);
  const leagueFtPct = totalFTA === 0 ? 0 : totalFTM / totalFTA;

  // Build a map of { statKey: { mean, std } }
  const stats = {} as Record<string, { mean: number; std: number }>;

  // First pass: compute derived impact values and collect stat arrays
  const statArrays: Record<string, number[]> = {};

  players.forEach((p) => {
    STAT_KEYS.forEach((k) => {
      let value = p[k] as number;

      if (k === "fg_pct") {
        value = p.fg_pct - leagueFgPct  // FG impact
      } else if (k === "ft_pct") {
        value = p.ft_pct - leagueFtPct  // FT impact
      }

      // Zero-inflated categories
      if (ZERO_INFLATED.includes(k)) {
        // Treat 0 as lowest, but keep it numeric
        value = value === 0 ? 0 : value;
      }

      if (!statArrays[k]) statArrays[k] = [];
      statArrays[k].push(value);
      // store the transformed value
      p[`${k}_zscore`] = value;
    });
  });

  // Second pass: compute mean & std for each stat
  Object.keys(statArrays).forEach((k) => {
    const arr = statArrays[k];
    const mean = arr.reduce((s, x) => s + x, 0) / arr.length;
    const variance =
      arr.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / arr.length;
    const std = Math.sqrt(variance) || 1; // avoid div-by-zero

    stats[k] = { mean, std };
  });

  // Third pass: compute z-scores (with caps)
  players.forEach((p) => {
    STAT_KEYS.forEach((k) => {
      let v = p[`${k}_zscore`] as number;
      const { mean, std } = stats[k];

      let z = (v - mean) / std;

      // Turnovers: higher is worse
      if (k === TURNOVER) {
        z = -z;
      }

      // Cap Z-scores for heatmap & fairness
      const CAP = 3;
      if (z > CAP) z = CAP;
      if (z < -CAP) z = -CAP;

      p[`${k}_zscore`] = z;
    });
  });

  return players;
}

function computeZScoreRatings(
  players: PlayerRow[],
  weights: Record<string, number> = {}
) {
  players.forEach((p) => {
    let totalWeight = 0;
    let sum = 0;

    STAT_KEYS.forEach((k) => {
      const key = `${k}_zscore` as keyof PlayerRow
      const pct = p[key] ?? 0; // treat missing ratings as 0
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
