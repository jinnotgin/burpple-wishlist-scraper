#!/bin/bash
# This is a file to update the git repository after scraping for latest data from Burpple.
# Copyright (c) 2021, Jin, jinn.me / linjin.me
# ----
# SAMPLE CRONTAB ENTRY (run at 11:00 AM/PM daily)
# 0 11,23 * * * /home/jin/burpple-wishlist-scraper/faveats_scrapepush.sh

# define git
GIT=`which git`

# node is commented out - not using node, but NVM
# NODE=`which node`

# https://devimalplanet.com/using-nvm-in-cron-jobs
# Load nvm
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 16.9.0

REPO_DIR=/home/jin/burpple-wishlist-scraper/
cd ${REPO_DIR}

${GIT} pull

# ${NODE} index.js
node index.js 

${GIT} add --all .
CURRENTDATE=`date +"%Y-%m-%d %T"`
${GIT} commit -m "Updated user data on $CURRENTDATE"
${GIT} push
