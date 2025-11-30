import json
import time
from nba_api.stats.endpoints import LeagueDashPlayerStats, PlayerDashboardByLastNGames

def fetch_players(season="2025-26"):
    start_time = time.time()
    players_list = []
    failed_players = []

    print(f"Fetching season {season} per-game stats...")

    # Fetch season averages for all active players (no MIN filter)
    try:
        season_df = LeagueDashPlayerStats(season=season, per_mode_detailed="PerGame").get_data_frames()[0]
        print(f"Total players returned: {len(season_df)}")
    except Exception as e:
        print("Failed to fetch LeagueDashPlayerStats:", e)
        return

    for idx, row in season_df.iterrows():
        player_id = row["PLAYER_ID"]
        player_name = row["PLAYER_NAME"]

        try:
            # Build player dict
            player = {
                "id": player_id,
                "name": player_name,
                "team_id": row["TEAM_ID"],
                "team": row["TEAM_ABBREVIATION"],
                "games_played": row["GP"],
                "min": row["MIN"],
                "pts": row["PTS"],
                "reb": row["REB"],
                "ast": row["AST"],
                "stl": row["STL"],
                "blk": row["BLK"],
                "tov": row["TOV"],
                "fgm": row["FGM"],
                "fga": row["FGA"],
                "ftm": row["FTM"],
                "fta": row["FTA"],
                "fg_pct": row["FG_PCT"],
                "ft_pct": row["FT_PCT"],
                "fg3m": row["FG3M"]
            }

            # Try to fetch last 5 games averages
            try:
                last5_df = PlayerDashboardByLastNGames(
                    player_id=player_id,
                    last_n_games=5,
                    season=season,
                    per_mode_detailed='PerGame'
                ).get_data_frames()[0]

                player.update({
                    "last5_min": last5_df["MIN"].iloc[0],
                    "last5_pts": last5_df["PTS"].iloc[0],
                    "last5_reb": last5_df["REB"].iloc[0],
                    "last5_ast": last5_df["AST"].iloc[0],
                    "last5_stl": last5_df["STL"].iloc[0],
                    "last5_blk": last5_df["BLK"].iloc[0],
                    "last5_tov": last5_df["TOV"].iloc[0],
                    "last5_fgm": last5_df["FGM"].iloc[0],
                    "last5_fga": last5_df["FGA"].iloc[0],
                    "last5_ftm": last5_df["FTM"].iloc[0],
                    "last5_fta": last5_df["FTA"].iloc[0],
                    "last5_fg_pct": last5_df["FG_PCT"].iloc[0],
                    "last5_ft_pct": last5_df["FT_PCT"].iloc[0],
                    "last5_fg3m": last5_df["FG3M"].iloc[0]
                })
            except Exception:
                # fallback if last 5 games not available
                player.update({
                    "last5_min": 0,
                    "last5_pts": 0,
                    "last5_reb": 0,
                    "last5_ast": 0,
                    "last5_stl": 0,
                    "last5_blk": 0,
                    "last5_tov": 0,
                    "last5_fg_pct": 0,
                    "last5_ft_pct": 0,
                    "last5_fg3m": 0
                })

            players_list.append(player)
            print(f"✅ Added {player_name}")

        except Exception as e:
            failed_players.append({
                "name": player_name,
                "reason": str(e) if str(e) else "fail_to_fetch"
            })
            print(f"❌ Failed for {player_name}: {e}")

        time.sleep(0.3)  # small delay to reduce rate-limiting

    # Build JSON with metadata
    result = {
        "players": players_list,
        "failed_players": failed_players,
        "_meta": {
            "season": season,
            "total_players": len(season_df),
            "players_loaded": len(players_list),
            "players_failed": len(failed_players)
        }
    }

    # Save JSON
    with open("data/players.json", "w") as f:
        json.dump(result, f, indent=2)

    # Print summary
    end_time = time.time()
    print(f"\n✅ Finished! {len(players_list)}/{len(season_df)} players loaded successfully.")
    if failed_players:
        print(f"❌ {len(failed_players)} players failed. See 'failed_players' in JSON.")
    print(f"⏱ Script completed in {end_time - start_time:.2f} seconds.")


if __name__ == "__main__":
    fetch_players()
