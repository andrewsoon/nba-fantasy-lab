import json
from nba_api.stats.endpoints import commonallplayers, commonplayerinfo
from time import sleep

def fetch_player_positions(season="2025-26"):
    """
    Fetch all active NBA players' IDs and positions.
    Returns a dict with data and meta info:
    {
        "players": [{'player_id': 123, 'position': 'G'}, ...],
        "meta": {
            "failed_players": [456, 789]
        }
    }
    """
    try:
        all_players = commonallplayers.CommonAllPlayers(
            season=season,
            is_only_current_season=1
        ).get_data_frames()[0]
    except Exception as e:
        print("Failed to fetch all players:", e)
        return {"players": [], "meta": {"failed_players": []}}

    positions = []
    failed_players = []

    for _, row in all_players.iterrows():
        if row["ROSTERSTATUS"] != 1:
            continue

        player_id = row["PERSON_ID"]
        try:
            info = commonplayerinfo.CommonPlayerInfo(player_id=player_id).get_data_frames()[0]
            pos = info["POSITION"].values[0] if "POSITION" in info.columns else "Unknown"
            print(f"✅ {player_id} loaded")
        except Exception as e:
            print(f"⚠ Failed to fetch position for player {player_id}: {e}")
            pos = "Unknown"
            failed_players.append(player_id)

        positions.append({"player_id": player_id, "position": pos})
        
        sleep(0.5)  # polite delay

    print(f"\nFetched {len(positions)} active players.")
    if failed_players:
        print(f"\n⚠ Failed to fetch position for {len(failed_players)} players:")
        print(failed_players)

    # Combine data and meta into a single dict
    result = {
        "players": positions,
        "meta": {
            "failed_players": failed_players
        }
    }

    # Save to JSON
    with open("data/player_positions.json", "w") as f:
        json.dump(result, f, indent=2)

    return result

if __name__ == "__main__":
    data = fetch_player_positions()
