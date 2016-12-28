#!/bin/bash
psql --username=${DB_USER} --host=${DB_HOST} --port=${DB_PORT} ${DB_NAME}
