#!/bin/bash
pkill node
touch ./log.txt
yarn start -- --release --test > ./log.txt 2>&1 &
tail -f ./log.txt |
  while IFS= read -r line
  do
    echo "$line"
    if [[ $line == *"webpack: bundle is now VALID"* ]]
    then
      exit;
    fi
  done
