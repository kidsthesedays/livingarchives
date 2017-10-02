#!/bin/bash
set -e

# Don't allow using the default postgres user
if [ "$POSTGRES_USER" == "postgres" ]
then
    echo "Clearing the statistics table as the default postgres user is not allowed."
    echo "make sure to set the $POSTGRES_USER environment variable."
    exit 1
fi

echo "Truncating table: statistics"
echo "---------------"

# Finding alberta
psql -U $POSTGRES_USER -c 'TRUNCATE statisticsFindingAlberta'
echo "Successfully truncated the table: statisticsFindingAlberta"

# Bitter and sweet
psql -U $POSTGRES_USER -c 'TRUNCATE statisticsBitterAndSweet'
echo "Successfully truncated the table: statisticsBitterAndSweet"
