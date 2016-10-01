#!/bin/bash
source ./.docker-pg
./prepare.sh

tag=""
if [ ! -z "$1" ]
then
  tag=":$1"
fi

./shutdown.sh
docker run -d -P \
	-e DB_NAME=<db_name> \
	-e DB_USER=<db_user> \
	-e DB_PASSWORD=<db_password> \
	--volumes-from ${docker_pg_volume} \
	--name ${docker_pg_postgres} ${docker_pg_prefix}/${docker_pg_postgres}${tag}
