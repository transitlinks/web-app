#!/bin/bash
source ./.docker-pgrouting
container="$(docker ps -a | grep ${docker_pg_postgres} | awk '{ print $7 }')"
if [ -z "$container" ]
then
  echo "${docker_pg_postgres} already removed"
  exit
fi

docker stop ${docker_pg_postgres}
docker rm ${docker_pg_postgres}
