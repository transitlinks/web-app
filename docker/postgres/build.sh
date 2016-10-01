#!/bin/bash
source ./.docker-pg
if [ -z "$1" ] && [ -z "$2" ]
then
  docker build -t ${docker_pg_prefix}/${docker_pg_postgres} .
  exit
fi

docker build -t ${docker_pg_prefix}/${docker_pg_postgres}:$1 .
if [ ! -z "$2" ]
then
  docker tag -f ${docker_pg_prefix}/${docker_pg_postgres}:$1 ${docker_pg_prefix}/${docker_pg_postgres}:$2
fi
