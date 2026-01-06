import positionsData from "@/data/player_positions.json";

interface RawPlayersPosition {
  player_id: number
  position: string
}

export function usePlayersPositions() {
  const rawPostionsArray: RawPlayersPosition[] = positionsData
  const positionsMap: Record<number, string> = rawPostionsArray.reduce((map, player) => {
    map[player.player_id] = getPositions(player.position)
    return map
  }, {} as Record<number, string>)
  return positionsMap
}

function getPositions(posString: string) {
  return posString.split('-').map(p => p.trim()[0].toUpperCase()).join(', ')
}