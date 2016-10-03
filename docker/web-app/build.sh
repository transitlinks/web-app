#!/bin/bash
if [ -z "$1" ] && [ -z "$2" ]
then
  docker build -t vhalme/transitlinks .
  exit
fi

if [ "$1" == "--no-cache" ]
then
  docker build -t vhalme/transitlinks --no-cache .
  exit
fi

docker build -t vhalme/transitlinks:$1 .
if [ ! -z "$2" ]
then
  if [ "$2" == "--no-cache" ]
  then
    docker build -t vhalme/transitlinks:$1 --no-cache .
    exit
  fi
  docker tag vhalme/transitlinks:$1 vhalme/transitlinks:$2 $3 .
fi
