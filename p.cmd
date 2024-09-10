@echo off

call u.cmd
call b.cmd

git add *
git commit -m publish
git push