import requests
import pandas as pd
from datetime import timedelta
import json

def fetch_weekly_opponents_with_dates(season_year="2025-26"):
    url = "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json"
    r = requests.get(url)
    r.raise_for_status()
    data = r.json()

    games_list = []

    # Extract regular season + Emirates NBA Cup
    for day in data["leagueSchedule"]["gameDates"]:
        for g in day["games"]:
            label = (g.get("gameLabel") or "").strip()
            subtype = (g.get("gameSubtype") or "").strip()

            if label == "" or label == "In-Season Tournament" or subtype in ["In-Season Tournament", "NBA Cup", "Emirates NBA Cup"]:
                games_list.append({
                    "GAME_DATE": g["gameDateUTC"],
                    "HOME_TEAM": g["homeTeam"]["teamTricode"],
                    "AWAY_TEAM": g["awayTeam"]["teamTricode"],
                })

    df = pd.DataFrame(games_list)
    df["GAME_DATE"] = pd.to_datetime(df["GAME_DATE"], utc=True)

    # Align season start (first Monday on/after first game)
    season_start = df["GAME_DATE"].min().normalize()
    season_start = season_start + pd.Timedelta(days=(7 - season_start.weekday()) % 7)

    weekly_opponents = {}

    for _, row in df.iterrows():
        game_date = row["GAME_DATE"]
        week_num = ((game_date - season_start).days // 7) + 1

        # Initialize week
        if week_num not in weekly_opponents:
            week_start = season_start + pd.Timedelta(weeks=week_num-1)
            week_end = week_start + pd.Timedelta(days=6)
            weekly_opponents[week_num] = {
                "start_date": week_start.strftime("%Y-%m-%d"),
                "end_date": week_end.strftime("%Y-%m-%d"),
                "teams": {}
            }

        for team, opp in [(row["HOME_TEAM"], row["AWAY_TEAM"]), (row["AWAY_TEAM"], row["HOME_TEAM"])]:
            if team not in weekly_opponents[week_num]["teams"]:
                weekly_opponents[week_num]["teams"][team] = []
            weekly_opponents[week_num]["teams"][team].append(opp)

    # Save to JSON
    with open("data/weekly_opponents.json", "w") as f:
        json.dump(weekly_opponents, f, indent=2)

    return weekly_opponents


if __name__ == "__main__":
    weekly_opps = fetch_weekly_opponents_with_dates()
    print(f"✅ Weekly opponent lists with dates saved. Weeks: {len(weekly_opps)}")
    # Example: print Week 1 LAL opponents and week dates
    week1 = weekly_opps.get(1, {})
    print("Week 1 dates:", week1.get("start_date"), "to", week1.get("end_date"))
    print("Week 1 LAL opponents:", week1.get("teams", {}).get("LAL", []))
