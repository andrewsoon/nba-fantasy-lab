const NUM_TIERS = 7;

// norm: normalized score 0–1
function getTier(norm: number): number {
  // apply a power curve to stretch higher scores
  return Math.min(Math.floor(norm * NUM_TIERS), NUM_TIERS - 1);
}

export function getHeatmapColor(value: number, min: number, max: number, invert = false, isDark = false) {
  if (max === min) return "transparent"; // fallback for no range
  let norm = (value - min) / (max - min);
  if (invert) norm = 1 - norm; // for TOV, lower is better

  // Map to 0–6 (7 levels)
  const tier = getTier(norm);

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

export function weightedFG(pct: number, attmpt: number, alpha = 1.5, beta = 0.2) {
  return Math.pow(pct, alpha) * Math.pow(attmpt, beta);
}