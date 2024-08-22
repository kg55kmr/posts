@echo off

node build.js

git add *
git commit -m publish
git push