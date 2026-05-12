@echo off

call pnpm -C ../kg55kmr -r posts || exit /b

git add *
git commit -m update
git push