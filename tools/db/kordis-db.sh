#!/bin/bash
set -e

MONGO_CONTAINER_NAME="kordis-dev-db"
MONGO_DB_IMAGE_NAME="mongo:7.0"
LOCAL_MONGO_URI="mongodb://127.0.0.1:27017"
EXEC_PATH=$(dirname "${BASH_SOURCE[0]}")

ensure_running() {
	if docker ps -a --format '{{.Names}}' | grep -q "^${MONGO_CONTAINER_NAME}\$"; then
		if docker ps --format '{{.Names}}' | grep -q "^${MONGO_CONTAINER_NAME}\$"; then
			echo "MongoDB already running."
		else
			docker start "${MONGO_CONTAINER_NAME}" > /dev/null
			echo "MongoDB started."
		fi
	else
		docker run -d --name "${MONGO_CONTAINER_NAME}" -p 27017:27017 "${MONGO_DB_IMAGE_NAME}" > /dev/null
		echo "MongoDB created and started."
	fi


	# We have to wait for the MongoDB process to be up and running
	until [ "$(docker inspect -f "{{.State.Running}}" $MONGO_CONTAINER_NAME)" == "true" ]; do
      sleep 0.1;
  done;
	until docker exec $MONGO_CONTAINER_NAME mongo --quiet --eval "quit()" > /dev/null 2>&1; do
      sleep 1
  done
}

ensure_clean_db() {
	db_name="$1"
	db_exists=$(docker exec $MONGO_CONTAINER_NAME mongo --quiet --eval "db.getMongo().getDBNames().indexOf('$db_name') > -1")

	if [[ $db_exists == "true" ]]; then
		read -p "A Database with that Name already exists. If you don't delete the DB, the data will simply be inserted on top of existing data! Do you want to delete the database '$db_name'? (y/n): " confirmation

		if [[ $confirmation == "y" || $confirmation == "Y" ]]; then
			docker exec $MONGO_CONTAINER_NAME mongo --quiet --eval "db.getSiblingDB('$db_name').dropDatabase()"
			echo "The database '$db_name' has been deleted."
		fi
	fi
}

init() {
	if [ -z "$1" ]; then
		echo "Error: You did not specify a database name."
		exit 1
	fi
	db_name="$1"
	conn_uri="$LOCAL_MONGO_URI/$db_name"

	ensure_running
	ensure_clean_db "$db_name"

	echo "Importing dev data into local MongoDB..."
	"$EXEC_PATH/data/import.ts" "$conn_uri"

	echo "Ready at $conn_uri"
}

from_remote() {
	if [ -z "$1" ]; then
		echo "Error: You have to provide the connection uri for the remote dev db!"
		exit 1
	fi

	if [ -z "$2" ]; then
		echo "Error: You have to provide a DB name!"
		exit 1
	fi

	ensure_running

	remote_conn_uri="$1"
	remote_db_name=${remote_conn_uri##*/}
	remote_db_name=${remote_db_name%%\?*}
	local_db_name="$2"
	local_conn_uri="$LOCAL_MONGO_URI/$local_db_name"
	echo "Cloning the remote Database $remote_db_name into $local_db_name"

	ensure_clean_db "$local_db_name"

	docker exec $MONGO_CONTAINER_NAME mongodump --quiet --uri="$remote_conn_uri"
	docker exec $MONGO_CONTAINER_NAME mongorestore --quiet --uri="$local_conn_uri" -d "$local_db_name" "dump/$remote_db_name"
	docker exec $MONGO_CONTAINER_NAME rm -rf dump

	echo "Ready at $local_conn_uri"
}

if [ "$1" == "from-remote" ]; then
	from_remote "$2" "$3"
elif [ "$1" == "init" ]; then
	init "$2"
elif [ "$1" == "new-migration" ]; then
		if [ -z "$2" ]; then
  		"$EXEC_PATH/migrations/cli.ts" new
		else
			"$EXEC_PATH/migrations/cli.ts" new -n "$2"
  	fi
  	echo "Create new migration in $EXEC_PATH/migrations"
elif [ "$1" == "revert-last-migration" ]; then
	"$EXEC_PATH/migrations/cli.ts" down -l
	"$EXEC_PATH/migrations/cli.ts" status
elif [ "$1" == "apply-pending-migrations" ]; then
	"$EXEC_PATH/migrations/cli.ts" up
	"$EXEC_PATH/migrations/cli.ts" status
else
	echo "Please provide a valid argument (from-remote, init, new-migration)"
fi
