#!/bin/bash
pkill node
touch ./log.txt
npm start -- --release --test > ./log.txt 2>&1 &
tail -f ./log.txt |
  while IFS= read -r line
  do
    echo "$line"
    if [[ $line == *"Finished 'start'"* ]]
    then
      exit;
    fi
  done
