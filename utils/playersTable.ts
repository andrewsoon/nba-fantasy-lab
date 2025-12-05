import { StatKeys } from "@/types/player";

const NUM_TIERS = 7;

// norm: normalized score 0–1
function getTier(norm: number): number {
  // apply a power curve to stretch higher scores
  return Math.min(Math.floor(norm * NUM_TIERS), NUM_TIERS - 1);
}

function percentileToTier7(p: number): number {
  if (p >= 0.85) return 1;
  if (p >= 0.70) return 2;
  if (p >= 0.55) return 3;
  if (p >= 0.45) return 4;
  if (p >= 0.30) return 5;
  if (p >= 0.15) return 6;
  return 7;
}

export function getHeatmapColor(value: number, min: number, max: number, invert = false, isDark = false, isPercentile = true) {

  let tier: number

  if (isPercentile) {
    let pct = value
    if (!invert) pct = 1 - pct
    tier = percentileToTier7(pct)
  } else {
    if (max === min) return "transparent"; // fallback for no range
    let norm = (value - min) / (max - min);
    if (invert) norm = 1 - norm; // for TOV, lower is better

    // Map to 0–6 (7 levels)
    tier = getTier(norm);
  }

  // Predefined scale (deep → faint → neutral → faint → deep)
  const light_colors = [
    "#b2182b", // deep red
    "#d6604d", // soft red
    "#f4a582", // light salmon
    "transparent", // neutral light
    "#b8e3b8", // pale green
    "#66c266", // medium green
    "#1a8e1a", // deep green
  ];

  const dark_colors = [
    "#bb0000", // lowest (strong negative)
    "#880000",
    "#444400", // slightly negative / neutral-ish
    "transparent", // true neutral
    "#004400", // slightly positive
    "#008800",
    "#00bb00"  // highest (strong positive)
  ]

  const colors = isDark ? dark_colors : light_colors

  return colors[tier];
}

export const StatLabels: Record<StatKeys, string> = {
  pts: "PTS",
  ast: "AST",
  reb: "REB",
  stl: "STL",
  blk: "BLK",
  fg3m: "3PM",
  fg_pct: "FG%",
  ft_pct: "FT%",
  tov: "TOV"
}