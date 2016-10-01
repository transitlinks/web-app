#!/bin/bash
if [ ! -d "lib" ]; then
  curl -O http://selenium-release.storage.googleapis.com/2.53/selenium-server-standalone-2.53.1.jar
  mkdir lib
  mv selenium-server-standalone-2.53.1.jar lib/
fi
java -jar lib/selenium-server-standalone-2.53.1.jar
