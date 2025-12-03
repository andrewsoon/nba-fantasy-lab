import json
import time
from datetime import datetime, timedelta
import pandas as pd
from nba_api.stats.endpoints import LeagueDashPlayerStats, PlayerGameLog

# ---------------------------
# Config
# ---------------------------
season = "2025-26"
sleep_time = 0.3  # seconds between API calls to avoid rate limiting

# ---------------------------
# Helper function
# ---------------------------
def compute_totals_and_avgs(df):
    if df.empty:
        return {}, {}
    totals = df[['MIN','PTS','REB','AST','STL','BLK','TOV','FGM','FGA','FTM','FTA','FG3M','FG3A']].sum().to_dict()
    gp = len(df)
    avgs = {k: v / gp for k, v in totals.items()}
    avgs['fg_pct'] = totals['FGM'] / totals['FGA'] if totals['FGA'] > 0 else 0
    avgs['ft_pct'] = totals['FTM'] / totals['FTA'] if totals['FTA'] > 0 else 0
    avgs['fg3_pct'] = totals['FG3M'] / totals['FG3A'] if totals['FG3A'] > 0 else 0
    totals['gp'] = gp
    return totals, avgs

# ---------------------------
# Load cached data if exists
# ---------------------------
def load_cache():
    try:
        with open("data/players.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"players": [], "_meta": {}}

# ---------------------------
# Main script
# ---------------------------
def fetch_players(season=season):
    start_time = time.time()
    players_list = []
    failed_players = []

    # Load previous cache
    cache_data = load_cache()
    cached_players = {p["id"]: p for p in cache_data.get("players", [])}

    print(f"Fetching season {season} per-game stats...")

    try:
        season_df = LeagueDashPlayerStats(season=season, per_mode_detailed="PerGame").get_data_frames()[0]
        print(f"Total players returned: {len(season_df)}")
    except Exception as e:
        print("Failed to fetch LeagueDashPlayerStats:", e)
        return

    today = datetime.now()
    seven_days_ago = today - timedelta(days=7)
    fourteen_days_ago = today - timedelta(days=14)

    for idx, row in season_df.iterrows():
        player_id = row["PLAYER_ID"]
        player_name = row["PLAYER_NAME"]
        gp = row["GP"]

        try:
            season_avgs = {
                'min': row["MIN"], 'pts': row["PTS"], 'reb': row["REB"], 'ast': row["AST"],
                'stl': row["STL"], 'blk': row["BLK"], 'tov': row["TOV"], 'fgm': row["FGM"],
                'fga': row["FGA"], 'ftm': row["FTM"], 'fta': row["FTA"], 'fg3m': row["FG3M"],
                'fg_pct': row["FG_PCT"], 'ft_pct': row["FT_PCT"], 'fg3_pct': row["FG3_PCT"]
            }
            season_totals = {k: (v * gp if k not in ['fg_pct','ft_pct','fg3_pct'] else v) for k,v in season_avgs.items()}
            season_totals['gp'] = gp

            # -------------------------
            # GP-based caching check
            # -------------------------
            cached_player = cached_players.get(player_id)
            if cached_player and cached_player.get("season_totals", {}).get("gp") == gp:
                # GP unchanged → use cached 7/14-day stats
                last7_totals = cached_player.get("last7_totals", {})
                last7_avgs = cached_player.get("last7_avgs", {})
                last14_totals = cached_player.get("last14_totals", {})
                last14_avgs = cached_player.get("last14_avgs", {})
            else:
                # GP increased → fetch game logs
                try:
                    log_df = PlayerGameLog(player_id=player_id, season=season, season_type_all_star="Regular Season").get_data_frames()[0]
                    log_df['GAME_DATE'] = pd.to_datetime(log_df['GAME_DATE'])

                    last7_df = log_df[log_df['GAME_DATE'] >= seven_days_ago]
                    last7_totals, last7_avgs = compute_totals_and_avgs(last7_df)

                    last14_df = log_df[log_df['GAME_DATE'] >= fourteen_days_ago]
                    last14_totals, last14_avgs = compute_totals_and_avgs(last14_df)
                except Exception:
                    last7_totals, last7_avgs = {}, {}
                    last14_totals, last14_avgs = {}, {}

                time.sleep(sleep_time)

            # -------------------------
            # Build player dictionary
            # -------------------------
            player = {
                "id": player_id,
                "name": player_name,
                "team_id": row["TEAM_ID"],
                "team": row["TEAM_ABBREVIATION"],
                "season_totals": season_totals,
                "season_avgs": season_avgs,
                "last7_totals": last7_totals,
                "last7_avgs": last7_avgs,
                "last14_totals": last14_totals,
                "last14_avgs": last14_avgs
            }

            players_list.append(player)
            print(f"✅ Added {player_name}")

        except Exception as e:
            failed_players.append({"name": player_name, "reason": str(e) or "fail_to_fetch"})
            print(f"❌ Failed for {player_name}: {e}")

    # -------------------------
    # Save JSON
    # -------------------------
    result = {
        "_meta": {
            "season": season,
            "total_players": len(season_df),
            "players_loaded": len(players_list),
            "players_failed": len(failed_players),
            "fetched_at": datetime.now().isoformat()
        },
        "players": players_list,
        "failed_players": failed_players
    }

    with open("data/players.json", "w") as f:
        json.dump(result, f, indent=2)

    print(f"\n✅ Finished! {len(players_list)}/{len(season_df)} players loaded successfully.")
    print(f"⏱ Script completed in {time.time() - start_time:.2f} seconds.")

if __name__ == "__main__":
    fetch_players()
