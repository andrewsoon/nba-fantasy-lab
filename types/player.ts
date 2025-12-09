export interface Player {
  id: number,
  name: string,
  team_id: number,
  team: string,
  season_totals: StatCategory,
  season_avgs: StatCategory,
  last7_totals: StatCategory,
  last7_avgs: StatCategory,
  last14_totals: StatCategory,
  last14_avgs: StatCategory,
}

export type DatasetKeys =
  | 'season_totals'
  | 'season_avgs'
  | 'last7_totals'
  | 'last7_avgs'
  | 'last14_totals'
  | 'last14_avgs'

export interface StatCategory {
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

  rating?: number,
  rank?: number,

  // Percentiles
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

export const STAT_KEYS = [
  'pts',
  'reb',
  'ast',
  'fg_pct',
  'ft_pct',
  'fg3m',
  'stl',
  'blk',
  'tov'
] as const;

export type StatKeys = typeof STAT_KEYS[number]

