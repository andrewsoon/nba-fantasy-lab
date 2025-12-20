import { StatKeys } from "@/types/player";

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

function getTierFromZscore(z: number): number {
  if (z >= 2.0) return 0;       // elite
  if (z >= 1.0) return 1;       // great
  if (z >= 0.2) return 2;       // above avg
  if (z > -0.2) return 3;       // neutral
  if (z > -1.0) return 4;       // below avg
  if (z > -2.0) return 5;       // poor
  return 6;                     // terrible
}

function getFgPctTier(pct: number): number {
  if (pct >= 0.7) return 0;       // elite
  if (pct >= 0.63) return 1;       // great
  if (pct >= 0.5) return 2;       // above avg
  if (pct >= 0.45) return 3;       // neutral
  if (pct >= 0.40) return 4;       // below avg
  if (pct >= 0.3) return 5;       // poor
  return 6;                     // terrible
}

function getFtPctTier(pct: number): number {
  if (pct >= 0.92) return 0;       // elite
  if (pct >= 0.88) return 1;       // great
  if (pct >= 0.84) return 2;       // above avg
  if (pct >= 0.78) return 3;       // neutral
  if (pct >= 0.74) return 4;       // below avg
  if (pct >= 0.70) return 5;       // poor
  return 6;                     // terrible
}

function getStlTier(stl: number): number {
  if (stl >= 2) return 0;      // elite
  if (stl >= 1.5) return 1;    // great
  if (stl >= 1) return 2;      // above avg
  if (stl >= 0.7) return 3;    // neutral
  if (stl >= 0.5) return 4;    // below avg
  if (stl >= 0.3) return 5;    // poor
  return 6;                     // terrible
}

// Blocks per game
function getBlkTier(blk: number): number {
  if (blk >= 2) return 0;      // elite
  if (blk >= 1.5) return 1;    // great
  if (blk >= 1) return 2;      // above avg
  if (blk >= 0.5) return 3;    // neutral
  if (blk >= 0.3) return 4;    // below avg
  if (blk >= 0.2) return 5;    // poor
  return 6;                     // terrible
}

const tierFns: Partial<Record<StatKeys, (val: number) => number>> = {
  fg_pct: getFgPctTier,
  ft_pct: getFtPctTier,
  stl: getStlTier,
  blk: getBlkTier,
};


// ---------------------------
// Main function
// ---------------------------

export function getHeatmapColor(
  value: number,
  isDark = false,
  stat: StatKeys,
): string {
  const tier = tierFns[stat] ? tierFns[stat](value) : getTierFromZscore(value)

  const colors = isDark ? colorScales.dark : colorScales.light;
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

export function getZscore(
  value: number,
  mean?: number,
  std?: number,
) {
  if (!mean || !std) return 0
  if (std === 0) return 0
  return (value - mean) / std
}