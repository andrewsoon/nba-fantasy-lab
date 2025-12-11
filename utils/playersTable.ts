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

// ---------------------------
// Main function
// ---------------------------
export function getHeatmapColor(
  value: number,
  isDark = false,
): string {
  const tier = getTierFromZscore(value);

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