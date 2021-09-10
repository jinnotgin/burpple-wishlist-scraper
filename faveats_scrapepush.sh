#!/bin/bash


GIT=`which git`
NODE=`which node`
REPO_DIR=/home/jin/burpple-wishlist-scraper/

cd ${REPO_DIR}

${GIT} pull
${NODE} index.js 

${GIT} add --all .
CURRENTDATE=`date +"%Y-%m-%d %T"`
${GIT} commit -m "Updated data on $CURRENTDATE"
${GIT} push
