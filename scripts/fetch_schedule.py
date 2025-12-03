import requests
import pandas as pd
import json
from datetime import timedelta

def fetch_schedule(season_year="2025"):
    """
    Fetch the full NBA schedule from NBA's raw JSON feed and generate weekly games per team.
    season_year: str, e.g. "2025" for 2025-26 season
    """
    print(f"Fetching NBA full schedule for {season_year}-{int(season_year)+1}...")

    # Build URL for raw JSON schedule
    url = f"https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/{season_year}/league/00_full_schedule.json"

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print("Failed to fetch schedule:", e)
        return

    # Extract all games
    games_list = []
    for day in data.get("lscd", []):
        for game in day.get("mscd", {}).get("g", []):
            games_list.append({
                "GAME_ID": game.get("gid"),
                "GAME_DATE": game.get("gdte"),
                "HOME_TEAM_ABBR": game.get("h", {}).get("ta"),
                "VISITOR_TEAM_ABBR": game.get("v", {}).get("ta"),
                "STATUS": game.get("st")  # Scheduled / Final
            })

    games_df = pd.DataFrame(games_list)

    # --- Fix: convert to datetime and drop missing values ---
    games_df['GAME_DATE'] = pd.to_datetime(games_df['GAME_DATE'], errors='coerce')
    games_df = games_df.dropna(subset=['GAME_DATE'])

    # Align season start to first Monday
    season_start = games_df['GAME_DATE'].min()
    season_start = season_start - pd.Timedelta(days=season_start.weekday())

    # Weekly aggregation per team
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

        # Count home and away games per team
        for team in [row['HOME_TEAM_ABBR'], row['VISITOR_TEAM_ABBR']]:
            if team not in weekly_games[week_num]:
                weekly_games[week_num][team] = 0
            weekly_games[week_num][team] += 1

    # Save JSON
    with open("data/schedule.json", "w") as f:
        json.dump(weekly_games, f, indent=2)

    print(f"✅ Full schedule saved to 'data/schedule.json'. Total weeks: {len(weekly_games)}")

if __name__ == "__main__":
    fetch_schedule()
