#!/bin/bash
../node_modules/.bin/sequelize migration:create --url=${DB_URL} --models=../src/data/models --name=$1
