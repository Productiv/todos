#!/bin/bash

git add -A
git stash
git checkout master
git pull
git stash pop
git add -A
git commit -a -m "$1"
git push
git checkout heroku
git pull origin master
git push heroku heroku:master
