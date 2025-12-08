import { StatKeys } from "@/types/player";

const NUM_TIERS = 7;

const colorScales = {
  light: [
    "#1a8e1a", // deep green
    "#66c266", // medium green
    "#b8e3b8", // pale green
    "transparent", // neutral
    "#f4a582", // light salmon
    "#d6604d", // soft red
    "#b2182b", // deep red
  ],
  dark: [
    "#00bb00", // strong positive
    "#008800",
    "#004400", // slightly positive
    "transparent", // neutral
    "#444400", // neutral-ish
    "#880000",
    "#bb0000", // strong negative
  ],
};

// ---------------------------
// Tier calculation helpers
// ---------------------------
function getTierFromNorm(norm: number): number {
  // 0–1 normalized → 0–6 tier
  return Math.min(Math.floor(norm * NUM_TIERS), NUM_TIERS - 1);
}

function getTierFromPercentile(pct: number): number {
  if (pct >= 0.9) return 1;
  if (pct >= 0.75) return 2;
  if (pct >= 0.6) return 3;
  if (pct >= 0.45) return 4;
  if (pct >= 0.30) return 5;
  if (pct >= 0.15) return 6;
  return 7;
}

// ---------------------------
// Main function
// ---------------------------
export function getHeatmapColor(
  value: number,
  min: number,
  max: number,
  invert = false,
  isDark = false,
  isPercentile = true
): string {
  let tier: number;

  if (isPercentile) {
    let pct = invert ? 1 - value : value;
    tier = getTierFromPercentile(pct);
  } else {
    if (max === min) return "transparent";
    let norm = (value - min) / (max - min);
    if (invert) norm = 1 - norm;
    tier = getTierFromNorm(norm);
  }

  const colors = isDark ? colorScales.dark : colorScales.light;
  return colors[tier - 1];
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