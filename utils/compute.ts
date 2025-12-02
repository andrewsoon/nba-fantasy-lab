import { PlayerStats, PlayerStatsRaw } from "@/types/types";

export const StatsToUse = ["pts", "reb", "ast", "stl", "blk", "fg_pct_rating", "ft_pct_rating", "fg3m", "tov"] as const
export const Last5StatsToUse = ["last5_pts", "last5_reb", "last5_ast", "last5_stl", "last5_blk", "last5_fg_pct_rating", "last5_ft_pct_rating", "last5_fg3m", "last5_tov"] as const

export function computePlayerRatings(players: PlayerStatsRaw[]): PlayerStats[] {
  // Step 1: Prepare adjusted stats
  const adjustedStats: PlayerStats[] = players.map((p) => {
    return {
      ...p,
      player_rating: 0,
      last5_player_rating: 0,
      fg_pct_rating: p.fg_pct * p.fga,
      ft_pct_rating: p.ft_pct * p.fta,
      last5_fg_pct_rating: p.last5_fg_pct * p.fga,
      last5_ft_pct_rating: p.last5_ft_pct * p.last5_fta,
    }
  });

  // Step 2: Compute mean and std for each category
  const statsMean: Record<string, number> = {};
  const statsStd: Record<string, number> = {};

  StatsToUse.forEach((cat) => {
    const vals = adjustedStats.map((p) => p[cat] ?? 0);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const std = Math.sqrt(vals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / vals.length);
    statsMean[cat] = mean;
    statsStd[cat] = std || 1; // prevent divide by zero
  });

  const last5StatsMean: Record<string, number> = {};
  const last5StatsStd: Record<string, number> = {};

  Last5StatsToUse.forEach((cat) => {
    const vals = adjustedStats.map((p) => p[cat] ?? 0);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const std = Math.sqrt(vals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / vals.length);
    last5StatsMean[cat] = mean;
    last5StatsStd[cat] = std || 1; // prevent divide by zero
  });

  // Step 3: Compute z-scores and player_rating
  adjustedStats.forEach((p) => {
    let rating = 0;
    let last5Rating = 0;
    StatsToUse.forEach((cat) => {
      let z = ((p[cat] ?? 0) - statsMean[cat]) / statsStd[cat];
      if (cat === "tov") z *= -0.25; // lower TOV = better
      rating += z;
    });
    Last5StatsToUse.forEach((cat) => {
      let z = ((p[cat] ?? 0) - last5StatsMean[cat]) / last5StatsStd[cat];
      if (cat === "last5_tov") z *= -0.25; // lower TOV = better
      last5Rating += z;
    });
    p.last5_player_rating = last5Rating;
    p.player_rating = rating;
  });

  // Step 4: Sort by player_rating descending
  adjustedStats.sort((a, b) => (b.player_rating ?? 0) - (a.player_rating ?? 0));

  return adjustedStats;
}

export function getHeatmapColor(value: number, min: number, max: number, invert = false, isDark = false) {
  if (max === min) return "#f0f0f0"; // fallback for no range
  let norm = (value - min) / (max - min);
  if (invert) norm = 1 - norm; // for TOV, lower is better

  // Map to 0–6 (7 levels)
  const tier = Math.round(norm * 6);

  // Predefined scale (deep → faint → neutral → faint → deep)
  const light_colors = [
    "#b40000",
    "#d03c3c",
    "#e87a7a",
    "#ffffff",
    "#7ac27a",
    "#3c9e3c",
    "#007a00",
  ];

  const dark_colors = [
    "#B71C1C",
    "#D32F2F",
    "#F57C00",
    "#FBC02D",
    "#AFB42B",
    "#388E3C",
    "#1B5E20"
  ]

  const colors = isDark ? dark_colors : light_colors

  return colors[tier];
}

