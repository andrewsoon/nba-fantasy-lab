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

export type PlayerStatsKeys =
  | 'season_totals'
  | 'season_avgs'
  | 'last7_totals'
  | 'last7_avgs'
  | 'last14_totals'
  | 'last14_avgs';

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

  fg_weighted: number;   // fg_pct * fga
  ft_weighted: number;   // ft_pct * fta
}

export interface MinMaxCategory {
  min: number,
  max: number,
  weighted_min?: number,
  weighted_max?: number,
}

export type CategoryColKeys = Exclude<keyof StatCategory, 'min' | 'fgm' | 'fga' | 'ftm' | 'fta' | 'fg3a' | 'gp' | 'rating' | 'rank' | 'fg_weighted' | 'ft_weighted'>

export type StatCategoryMinMax = {
  season_totals: {
    [K in CategoryColKeys]: MinMaxCategory
  },
  season_avgs: {
    [K in CategoryColKeys]: MinMaxCategory
  },
  last7_totals: {
    [K in CategoryColKeys]: MinMaxCategory
  },
  last7_avgs: {
    [K in CategoryColKeys]: MinMaxCategory
  },
  last14_totals: {
    [K in CategoryColKeys]: MinMaxCategory
  },
  last14_avgs: {
    [K in CategoryColKeys]: MinMaxCategory
  },
}