#!/bin/bash
../node_modules/.bin/sequelize db:migrate --url=${DB_URL} --models=../src/data/models
