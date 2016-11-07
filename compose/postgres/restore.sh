#!/bin/bash
set -e

# Don't allow using the default postgres user
if [ "$POSTGRES_USER" == "postgres" ]
then
    echo "Restoring as the postgres user is not supported,"
    echo "make sure to set the $POSTGRES_USER environment variable."
    exit 1
fi

# Other commands use the postgres password
export PGPASSWORD=$POSTGRES_PASSWORD

# A filename is required
if [[ $# -eq 0 ]] ; then
    echo 'Usage:'
    echo '    docker-compose run postgres restore <backup-file>'
    echo ''
    echo 'To get a list of available backups, run:'
    echo '    docker-compose run postgres list-backups'
    exit 1
fi

# Backup filename
BACKUPFILE=/backups/$1

# check that the file exists
if ! [ -f $BACKUPFILE ]; then
    echo "Backup file not found."
    echo 'To get a list of available backups, run:'
    echo '    docker-compose run postgres list-backups'
    exit 1
fi

echo "Beginning restore from:"
echo "$1"
echo "-------------------------"

# Delete the database, if it fails - continue
echo "Deleting old database: $POSTGRES_USER"
if dropdb -h postgres -U $POSTGRES_USER $POSTGRES_USER
then echo "Database: $POSTGRES_USER - deleted!"
else echo "Database: $POSTGRES_USER - does not exist... continue"
fi

# Create the new database
echo "Creating new database: $POSTGRES_USER"
createdb -h postgres -U $POSTGRES_USER $POSTGRES_USER -O $POSTGRES_USER

# Restore the database
echo "Restoring database: $POSTGRES_USER"
gunzip -c $BACKUPFILE | psql -h postgres -U $POSTGRES_USER
