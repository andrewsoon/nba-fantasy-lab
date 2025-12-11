import json
import time
from datetime import datetime, timedelta, timezone
import pandas as pd
from nba_api.stats.endpoints import LeagueDashPlayerStats, PlayerGameLog

# ---------------------------
# Config
# ---------------------------
season = "2025-26"
sleep_time = 0.3  # seconds between API calls to avoid rate limiting
categories = ['MIN','PTS','REB','AST','STL','BLK','TOV','FGM','FGA','FTM','FTA','FG3M','FG3A']

# ---------------------------
# Helper functions
# ---------------------------
def compute_totals_and_avgs(df):
    """Compute totals and averages from a player game log DataFrame with lowercase keys."""
    if df.empty:
        return {k.lower(): 0 for k in categories}, {k.lower(): 0 for k in categories}

    totals = {k.lower(): df[k].sum() for k in categories}
    gp = len(df)

    avgs = {}
    for k in totals:
        avgs[k] = totals[k] / gp  # per-game averages for all stats

    # Percentages
    avgs['fg_pct'] = totals['fgm'] / totals['fga'] if totals['fga'] > 0 else 0
    avgs['ft_pct'] = totals['ftm'] / totals['fta'] if totals['fta'] > 0 else 0
    avgs['fg3_pct'] = totals['fg3m'] / totals['fg3a'] if totals['fg3a'] > 0 else 0

    totals['gp'] = gp
    avgs['gp'] = gp

    return totals, avgs

# ---------------------------
# Main script
# ---------------------------
def fetch_players(season=season):
    start_time = time.time()
    players_list = []
    failed_players = []

    print(f"Fetching season {season} list of players...")

    try:
        season_df = LeagueDashPlayerStats(season=season, per_mode_detailed="PerGame").get_data_frames()[0]
        print(f"Total players returned: {len(season_df)}")
    except Exception as e:
        print("Failed to fetch LeagueDashPlayerStats:", e)
        return

    # Get today in UTC at 00:00:00
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    seven_days_ago = today - timedelta(days=7)
    fourteen_days_ago = today - timedelta(days=14)

    for idx, row in season_df.iterrows():
        player_id = row.get("PLAYER_ID")
        player_name = row.get("PLAYER_NAME")

        try:
            # Fetch full season gamelogs (source of truth)
            log_df = PlayerGameLog(player_id=player_id, season=season, season_type_all_star="Regular Season").get_data_frames()[0]
            log_df['GAME_DATE'] = pd.to_datetime(log_df['GAME_DATE']).dt.tz_localize('UTC')

            # --- Season totals and averages (NEW) ---
            season_totals, season_avgs = compute_totals_and_avgs(log_df)

            # --- Last 7 days ---
            last7_df = log_df[log_df['GAME_DATE'] >= seven_days_ago]
            last7_totals, last7_avgs = compute_totals_and_avgs(last7_df)

            # --- Last 14 days ---
            last14_df = log_df[log_df['GAME_DATE'] >= fourteen_days_ago]
            last14_totals, last14_avgs = compute_totals_and_avgs(last14_df)

            time.sleep(sleep_time)

            player = {
                "id": player_id,
                "name": player_name,
                "team_id": row.get("TEAM_ID", 0),
                "team": row.get("TEAM_ABBREVIATION", ""),

                # UPDATED SEASON VALUES (NO MORE ROUNDED DATA)
                "season_totals": season_totals,
                "season_avgs": season_avgs,

                # EXISTING STRUCTURE
                "last7_totals": last7_totals,
                "last7_avgs": last7_avgs,
                "last14_totals": last14_totals,
                "last14_avgs": last14_avgs
            }

            players_list.append(player)
            print(f"✅ {player_name} loaded")

        except Exception as e:
            failed_players.append({"name": player_name, "reason": str(e)})
            print(f"❌ Failed {player_name}: {e}")

    # Save JSON
    result = {
        "_meta": {
            "season": season,
            "total_players": len(season_df),
            "players_loaded": len(players_list),
            "players_failed": len(failed_players),
            "fetched_at": datetime.now().isoformat()
        },
        "players": players_list,
        "failed_players": failed_players,
    }

    with open("data/players.json", "w") as f:
        json.dump(result, f, indent=2, default=int)  # converts all non-serializable numbers to int

    print(f"\n✅ Finished! {len(players_list)}/{len(season_df)} players loaded successfully.")
    print(f"⏱ Script completed in {time.time() - start_time:.2f} seconds.")

if __name__ == "__main__":
    fetch_players()
