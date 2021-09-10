#!/bin/bash
# This is a file to update the git repository after scraping for latest data from Burpple.
# Copyright (c) 2021, Jin, jinn.me / linjin.me
# ----
# SAMPLE CRONTAB ENTRY (run at 11:00 AM/PM daily)
# 0 11,23 * * * /home/jin/burpple-wishlist-scraper/faveats_scrapepush.sh

GIT=`which git`
touch a 
NODE=`which node`
touch b
REPO_DIR=/home/jin/burpple-wishlist-scraper/
touch c

cd ${REPO_DIR}
touch d

${GIT} pull
touch e
${NODE} index.js 
touch f

${GIT} add --all .
CURRENTDATE=`date +"%Y-%m-%d %T"`
${GIT} commit -m "Updated data on $CURRENTDATE"
${GIT} push
