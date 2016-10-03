#!/bin/bash
if [ "$TRAVIS_BRANCH" == "master" ]; then
  cd docker/web-app
  ./build.sh --no-cache
  docker login -e="$DOCKER_EMAIL" -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
  docker push vhalme/transitlinks
  curl -X POST http://198.211.124.91:3005/docker
fi
