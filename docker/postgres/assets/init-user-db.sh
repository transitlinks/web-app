#!/bin/bash
set -e

echo "Adding user config"
psql --username $POSTGRES_USER --dbname $POSTGRES_DB --command "CREATE ROLE $DB_USER WITH CREATEDB LOGIN PASSWORD '$DB_PASSWORD';"
psql --username $POSTGRES_USER --dbname $POSTGRES_DB --command "CREATE DATABASE $DB_NAME;"
echo "User config complete"
