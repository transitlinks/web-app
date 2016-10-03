container="$(docker ps -a | grep transitlinks | awk '{ print $7 }')"
if [ -z "$container" ]
then
  echo "transitlinks already removed"
  exit
fi

docker stop transitlinks
docker rm transitlinks
