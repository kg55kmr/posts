@echo off

call u.cmd || exit /b
call b.cmd || exit /b

git add *
git commit -m publish
git push