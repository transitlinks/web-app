#!/bin/bash
# docker pull quay.io/wantedly/nginx-image-server
docker run \
  --rm \
  -d \
  --name nginx-image-server \
  -p 80:80 \
  -p 8090:8090 \
  -v <MEDIA_PATH>:/var/www/nginx/images \
  -e "SERVER_NAME=<APP_URL>" \
  quay.io/wantedly/nginx-image-server:latest
