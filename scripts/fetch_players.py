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
categories = ['MIN','PTS','REB','AST','STL','BLK','TOV','FGM','FGA','FTM','FTA','FG3M','FG3A']

# ---------------------------
# Helper functions
# ---------------------------
def safe_get(d, key, default=0):
    return d.get(key, default) if d else default

def compute_totals_and_avgs(df):
    """Compute totals and averages from a player game log DataFrame with lowercase keys."""
    if df.empty:
        return {k.lower(): 0 for k in categories}, {k.lower(): 0 for k in categories}
    
    totals = {k.lower(): v for k, v in df[categories].sum().to_dict().items()}
    gp = len(df)
    avgs = {k: (v / gp if v is not None else 0) for k, v in totals.items()}
    
    # Percentages
    avgs['fg_pct'] = totals['fgm'] / totals['fga'] if totals['fga'] > 0 else 0
    avgs['ft_pct'] = totals['ftm'] / totals['fta'] if totals['fta'] > 0 else 0
    avgs['fg3_pct'] = totals['fg3m'] / totals['fg3a'] if totals['fg3a'] > 0 else 0
    
    totals['gp'] = gp
    return totals, avgs

# ---------------------------
# Main script
# ---------------------------
def fetch_players(season=season):
    start_time = time.time()
    players_list = []
    failed_players = []

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
        player_id = row.get("PLAYER_ID")
        player_name = row.get("PLAYER_NAME")
        gp = row.get("GP", 0)

        try:
            # Season averages and totals with lowercase keys + fallback to 0
            season_avgs = {k.lower(): row.get(k, 0) for k in ['MIN','PTS','REB','AST','STL','BLK','TOV','FGM','FGA','FTM','FTA','FG3M','FG3A','FG_PCT','FT_PCT','FG3_PCT']}
            season_totals = {k: (v * gp if k not in ['fg_pct','ft_pct','fg3_pct'] else v) for k,v in season_avgs.items()}
            season_totals['gp'] = gp

            try:
                log_df = PlayerGameLog(player_id=player_id, season=season, season_type_all_star="Regular Season").get_data_frames()[0]
                log_df['GAME_DATE'] = pd.to_datetime(log_df['GAME_DATE'])

                last7_df = log_df[log_df['GAME_DATE'] >= seven_days_ago]
                last7_totals, last7_avgs = compute_totals_and_avgs(last7_df)

                last14_df = log_df[log_df['GAME_DATE'] >= fourteen_days_ago]
                last14_totals, last14_avgs = compute_totals_and_avgs(last14_df)
            except Exception:
                last7_totals = {k.lower(): 0 for k in categories}
                last7_totals.update({'fg_pct': 0, 'ft_pct': 0, 'fg3_pct': 0, 'gp': 0})
                last7_avgs = last7_totals.copy()
                last14_totals = {k.lower(): 0 for k in categories}
                last14_totals.update({'fg_pct': 0, 'ft_pct': 0, 'fg3_pct': 0, 'gp': 0})
                last14_avgs = last14_totals.copy()

            time.sleep(sleep_time)

            player = {
                "id": player_id,
                "name": player_name,
                "team_id": row.get("TEAM_ID", 0),
                "team": row.get("TEAM_ABBREVIATION", ""),
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

    for timeframe in ["season", "last7", "last14"]:
        totals_key = f"{timeframe}_totals"
        avgs_key = f"{timeframe}_avgs"

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
        json.dump(result, f, indent=2)

    print(f"\n✅ Finished! {len(players_list)}/{len(season_df)} players loaded successfully.")
    print(f"⏱ Script completed in {time.time() - start_time:.2f} seconds.")

if __name__ == "__main__":
    fetch_players()
