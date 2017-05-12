#!/bin/bash
cd docker/postgres
source ./.docker-pg
./prepare.sh

tag=""
if [ ! -z "$1" ]
then
  tag=":$1"
fi

./shutdown.sh
docker run -d -p 54321:5432 \
	-e DB_NAME=<DB_NAME> \
	-e DB_USER=<DB_USER> \
	-e DB_PASSWORD=<DB_PASSWORD> \
	--volumes-from ${docker_pg_volume} \
	--name ${docker_pg_postgres} ${docker_pg_prefix}/${docker_pg_postgres}${tag}
