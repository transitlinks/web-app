#!/bin/bash
if [ "$TRAVIS_BRANCH" == "master" ]; then
  cd docker/web-app
  ./build.sh --no-cache
  docker login -e="$DOCKER_EMAIL" -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD";
  docker push USER/REPO;
fi
