#!/bin/bash
git push origin master
cd docker/web-app
./build.sh --no-cache
docker push vhalme/transitlinks:latest
cd ../..
ssh root@transitlinks.net "cd scripts; ./deploy.sh; exit;"
