const NUM_TIERS = 7;

// norm: normalized score 0–1
function getTier(norm: number): number {
  // apply a power curve to stretch higher scores
  const adjusted = Math.pow(norm, 0.5); // sqrt makes top values more granular
  return Math.min(Math.floor(adjusted * NUM_TIERS), NUM_TIERS - 1);
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
    "#f7f7f7", // neutral light
    "#b8e3b8", // pale green
    "#66c266", // medium green
    "#1a8e1a", // deep green
  ];

  const dark_colors = [
    "#001100", // lowest (very dark green)
    "#003300",
    "#005500",
    "#007700",
    "#009900",
    "#00bb00",
    "#00dc00ff", // highest (bright green)
  ]

  const colors = isDark ? dark_colors : light_colors

  return colors[tier];
}