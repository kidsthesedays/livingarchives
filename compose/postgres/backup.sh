#!/bin/bash
set -e

# Don't allow using the default postgres user
if [ "$POSTGRES_USER" == "postgres" ]
then
    echo "Creating a backup as the postgres user is not supported,"
    echo "make sure to set the $POSTGRES_USER environment variable."
    exit 1
fi

# Other commands use the postgres password
export PGPASSWORD=$POSTGRES_PASSWORD

echo "Creating backup"
echo "---------------"

FILENAME=backup_$(date +'%Y_%m_%dT%H_%M_%S').sql.gz
pg_dump -h postgres -U $POSTGRES_USER | gzip > /backups/$FILENAME

echo "Successfully created backup: $FILENAME"
