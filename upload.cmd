@echo off

call pnpm -C ../kg55kmr --filter posts build || exit /b

git add *
git commit -m update
git push