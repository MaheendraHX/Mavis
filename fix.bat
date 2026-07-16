@echo off
cd /d C:\Users\mahee\ARIA

echo Removing stray files...
del /f /q ersmaheeARIA 2>nul
del /f /q ARIA 2>nul
del /f /q "t" 2>nul
del /f /q ersmaheeARIAfrontend 2>nul

echo Unstaging stray files...
git rm --cached ersmaheeARIA 2>nul
git rm --cached ARIA 2>nul
git rm --cached "t" 2>nul
git rm --cached ersmaheeARIAfrontend 2>nul

echo Committing and pushing...
git add -A
git commit -m "fix: add missing has_messages to memory.py"
git push origin master

echo Done!
pause
