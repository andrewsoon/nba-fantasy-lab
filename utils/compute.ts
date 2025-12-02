import { PlayerStats, PlayerStatsRaw } from "@/types/types";

export const StatsToUse = ["pts", "reb", "ast", "stl", "blk", "fg_pct_rating", "ft_pct_rating", "fg3m", "tov"] as const

export function computePlayerRatings(players: PlayerStatsRaw[]): PlayerStats[] {
  // Step 1: Prepare adjusted stats
  const adjustedStats: PlayerStats[] = players.map((p) => {
    return {
      ...p,
      player_rating: 0,
      last5_player_rating: 0,
      fg_pct_rating: p.fg_pct * p.fga,
      ft_pct_rating: p.ft_pct * p.fta,
      last5_fg_pct_rating: p.last5_fg_pct * p.last5_fga,
      last5_ft_pct_rating: p.last5_ft_pct * p.last5_fta,
    }
  });

  // Step 2: Compute mean and std for each category
  const statsMean: Record<string, number> = {};
  const statsStd: Record<string, number> = {};

  StatsToUse.forEach((cat) => {
    const { sum, count } = adjustedStats.reduce(
      (acc, p) => {
        const v = p[cat];
        if (v !== undefined && v !== null) {
          acc.sum += v;
          acc.count += 1;
        }
        return acc;
      },
      { sum: 0, count: 0 }
    );

    const mean = count > 0 ? sum / count : 0;

    const std = Math.sqrt(
      adjustedStats.reduce((acc, p) => {
        const v = p[cat];
        return v !== undefined && v !== null ? acc + (v - mean) ** 2 : acc;
      }, 0) / (count || 1)
    );

    statsMean[cat] = mean;
    statsStd[cat] = std || 1; // prevent divide by zero
  });

  const last5StatsMean: Record<string, number> = {};
  const last5StatsStd: Record<string, number> = {};

  StatsToUse.forEach((cat) => {
    const vals = adjustedStats.map((p) => p[`last5_${cat}`] ?? 0);
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
    StatsToUse.forEach((cat) => {
      let z = ((p[`last5_${cat}`] ?? 0) - last5StatsMean[cat]) / last5StatsStd[cat];
      if (cat === "tov") z *= -0.25; // lower TOV = better
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
  if (max === min) return "transparent"; // fallback for no range
  let norm = (value - min) / (max - min);
  if (invert) norm = 1 - norm; // for TOV, lower is better

  // Map to 0–6 (7 levels)
  const tier = Math.round(norm * 6);

  // Predefined scale (deep → faint → neutral → faint → deep)
  const light_colors = [
    "#b2182b", // deep red
    "#d6604d", // soft red
    "#f4a582", // light salmon
    "#f7f7f7", // neutral light
    "#b8e3b8", // pale green
    "#66c266", // medium green
    "#1a8e1a", // deep green
  ];

  const dark_colors = [
    "#8c1d1d", // deep red
    "#b53a3a", // red
    "#d67c7c", // soft red
    "#2b2b2b", // neutral dark
    "#5fa85f", // pale green (dark mode friendly)
    "#2e8b2e", // medium green
    "#166616", // deep green
  ]

  const colors = isDark ? dark_colors : light_colors

  return colors[tier];
}

