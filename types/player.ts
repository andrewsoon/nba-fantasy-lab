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

export const STAT_KEYS = [
  'fg_pct',
  'ft_pct',
  'fg3m',
  'pts',
  'reb',
  'ast',
  'stl',
  'blk',
  'tov'
] as const;

export type StatKeys = typeof STAT_KEYS[number]

