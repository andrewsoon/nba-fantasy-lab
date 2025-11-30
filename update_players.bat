@echo off

REM --- Change this to your repo folder ---
cd C:\Users\Andrew\Desktop\Personal\nba-fantasy-simulator

echo [1/3] Running Python script...
python scripts\fetch_players.py

echo [2/3] Committing changes...
git add data\players.json
git commit -m "Auto-update players" || echo "No changes to commit"

echo [3/3] Pushing to GitHub...
git push

echo Done!
pause
