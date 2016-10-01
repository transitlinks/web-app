#!/bin/bash
cd docker
cd postgres
docker create -v /var/lib/postgresql/data --name omatalous-data busybox
./build.sh
./deploy.sh
# docker build -t vhalme/omatalous-pg .
# docker run -d -P --volumes-from omatalous-data --name omatalous-pg vhalme/omatalous-pg
cd ..
cd web-app
./build.sh
./deploy.sh
# docker build -t vhalme/omatalous .
# docker run -d -p 8080:5000 --name omatalous --link omatalous-pg:pg vhalme/omatalous
cd ../..
