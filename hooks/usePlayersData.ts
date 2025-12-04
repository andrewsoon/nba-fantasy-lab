import PlayersData from "@/data/players.json";
import { Player, PlayerStatsKeys, StatCategory, StatCategoryMinMax } from "@/types/player";

interface UsePlayersData {
  players: Player[]
  category_min_max: StatCategoryMinMax
}

type StatCategoryStats = Record<keyof StatCategory, { mean: number; std: number }>;

function computeZScore(
  playerStats: StatCategory,
  stats: Partial<StatCategoryStats>
): number {
  let zScore = 0;
  for (const key of Object.keys(playerStats) as (keyof StatCategory)[]) {
    if (key === 'gp') continue; // skip GP
    const val = playerStats[key] ?? 0;
    const { mean = 0, std = 1 } = stats[key] ?? {};
    if (std === 0) continue; // avoid division by zero

    if (key === 'tov') {
      zScore -= (val - mean) * 0.25 / std
    } else {
      zScore += (val - mean) / std;
    }
  }
  return zScore;
};


function computeStats(players: Player[], keyPrefix: PlayerStatsKeys): Partial<StatCategoryStats> {
  const stats: Partial<StatCategoryStats> = {};
  for (const key of Object.keys(players[0][keyPrefix]) as (keyof StatCategory)[]) {
    if (key === 'gp') continue;
    const values = players.map(p => p[keyPrefix][key] ?? 0);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
    stats[key] = { mean, std };
  }
  return stats;
};


function toStatCategory(raw: Partial<StatCategory>, totalsGP?: number): StatCategory {
  const fg_pct = (raw.fga && raw.fgm) ? raw.fgm / raw.fga : 0
  const ft_pct = (raw.fta && raw.ftm) ? raw.ftm / raw.fta : 0
  return {
    min: raw.min ?? 0,
    pts: raw.pts ?? 0,
    reb: raw.reb ?? 0,
    ast: raw.ast ?? 0,
    stl: raw.stl ?? 0,
    blk: raw.blk ?? 0,
    tov: raw.tov ?? 0,
    fgm: raw.fgm ?? 0,
    fga: raw.fga ?? 0,
    ftm: raw.ftm ?? 0,
    fta: raw.fta ?? 0,
    fg3m: raw.fg3m ?? 0,
    fg3a: raw.fg3a ?? 0,
    fg_pct,
    ft_pct,
    gp: totalsGP ?? raw.gp ?? 0,

    fg_weighted: fg_pct * (raw.fga ?? 0),
    ft_weighted: ft_pct * (raw.fta ?? 0),
  }
};

function assignRanks(players: Player[], key: PlayerStatsKeys) {
  const sorted = [...players].sort((a, b) => (b[key].rating ?? 0) - (a[key].rating ?? 0))
  let lastRating: number = 0
  let rank = 0

  sorted.forEach((player, i) => {
    if (player[key].rating !== lastRating) {
      rank = i + 1
      lastRating = (player[key].rating ?? 0)
    }
    player[key].rank = rank
  })
}

export function usePlayersData(): UsePlayersData {
  const playersDataRaw = PlayersData.players
  const category_min_max = PlayersData.min_max

  const processedPlayersData: Player[] = playersDataRaw.map(player => ({
    id: player.id,
    name: player.name,
    team_id: player.team_id,
    team: player.team,
    season_totals: toStatCategory(player.season_totals, player.season_totals.gp),
    season_avgs: toStatCategory(player.season_avgs, player.season_totals.gp),
    last7_totals: toStatCategory(player.last7_totals, player.last7_totals.gp),
    last7_avgs: toStatCategory(player.last7_avgs, player.last7_totals.gp),
    last14_totals: toStatCategory(player.last14_totals, player.last14_totals.gp),
    last14_avgs: toStatCategory(player.last14_avgs, player.last14_totals.gp),
  }))

  const seasonTotalsStat = computeStats(processedPlayersData, 'season_totals')
  const seasonAvgsStat = computeStats(processedPlayersData, 'season_avgs')
  const last7TotalsStat = computeStats(processedPlayersData, 'last7_totals')
  const last7AvgsStat = computeStats(processedPlayersData, 'last7_avgs')
  const last14TotalsStat = computeStats(processedPlayersData, 'last14_totals')
  const last14AvgsStat = computeStats(processedPlayersData, 'last14_avgs')

  processedPlayersData.forEach(player => {
    player.season_totals.rating = computeZScore(player.season_totals, seasonTotalsStat)
    player.season_avgs.rating = computeZScore(player.season_avgs, seasonAvgsStat)
    player.last7_totals.rating = computeZScore(player.last7_totals, last7TotalsStat)
    player.last7_avgs.rating = computeZScore(player.last7_avgs, last7AvgsStat)
    player.last14_totals.rating = computeZScore(player.last14_totals, last14TotalsStat)
    player.last14_avgs.rating = computeZScore(player.last14_avgs, last14AvgsStat)
  })

  assignRanks(processedPlayersData, 'season_totals')
  assignRanks(processedPlayersData, 'season_avgs')
  assignRanks(processedPlayersData, 'last7_totals')
  assignRanks(processedPlayersData, 'last7_avgs')
  assignRanks(processedPlayersData, 'last14_totals')
  assignRanks(processedPlayersData, 'last14_avgs')

  return {
    players: processedPlayersData,
    category_min_max,
  }
}