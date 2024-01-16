#!/bin/sh

set -euo

echo "Setting runtime environment from env vars"

# Check if OAuth is set, otherwise set it to null
export OAUTH_CONFIG="${OAUTH_CONFIG:-null}"

envsubst <assets/config.template.json >assets/config.json

exec "$@"
