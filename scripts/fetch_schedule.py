from nba_api.stats.endpoints import LeagueGameLog
from nba_api.stats.static import teams
import pandas as pd
import json
from datetime import timedelta
import time

def fetch_schedule(season="2025-26"):
    start_time = time.time()
    print(f"Fetching NBA schedule for {season}...")

    # Get all teams
    all_teams = teams.get_teams()
    team_lookup = {t['id']: t['abbreviation'] for t in all_teams}

    # Fetch all games for the season
    try:
        games_df = LeagueGameLog(season=season, season_type_all_star='Regular Season').get_data_frames()[0]
    except Exception as e:
        print("Failed to fetch schedule:", e)
        return

    # Convert GAME_DATE to datetime
    games_df['GAME_DATE'] = pd.to_datetime(games_df['GAME_DATE'])

    # Find first Monday of the season as week 1 start
    season_start = games_df['GAME_DATE'].min()
    season_start = season_start - pd.Timedelta(days=season_start.weekday())  # align to Monday

    # Preprocess weekly games per team
    weekly_games = {}

    for _, row in games_df.iterrows():
        game_date = row['GAME_DATE']
        week_num = ((game_date - season_start).days // 7) + 1

        if week_num not in weekly_games:
            week_start = season_start + pd.Timedelta(weeks=week_num-1)
            week_end = week_start + pd.Timedelta(days=6)
            weekly_games[week_num] = {
                "start_date": week_start.strftime("%Y-%m-%d"),
                "end_date": week_end.strftime("%Y-%m-%d")
            }

        team_id = row['TEAM_ID']
        if team_id not in weekly_games[week_num]:
            weekly_games[week_num][team_id] = 0
        weekly_games[week_num][team_id] += 1

    # Replace team IDs with abbreviations
    weekly_games_abbr = {}
    for week, teams_dict in weekly_games.items():
        weekly_games_abbr[week] = {
            "start_date": teams_dict["start_date"],
            "end_date": teams_dict["end_date"]
        }
        for tid, count in teams_dict.items():
            if tid in ["start_date", "end_date"]:
                continue
            weekly_games_abbr[week][team_lookup.get(tid, str(tid))] = count

    # Save JSON in data folder
    with open("../data/schedule.json", "w") as f:
        json.dump(weekly_games_abbr, f, indent=2)

    end_time = time.time()
    print(f"✅ Finished! Schedule saved in '../data/schedule.json'. ⏱ Script completed in {end_time - start_time:.2f} seconds.")

if __name__ == "__main__":
    fetch_schedule()
