#!/bin/bash
source ./.docker-pgrouting
echo "Docker prefix:        " ${docker_pg_prefix}
echo "Volume container:     " ${docker_pg_volume}
echo "PostgreSQL container: " ${docker_pg_postgres}
volume_container="$(docker ps -a | grep ${docker_pg_volume} | awk '{ print $7 }')"
if [ -z "${volume_container}" ]
then
  echo "Creating volume ${docker_pg_volume}"
  docker create -v /var/lib/postgresql/data --name ${docker_pg_volume} busybox
fi
