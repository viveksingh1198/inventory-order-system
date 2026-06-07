#!/bin/sh
# Usage: ./scripts/push-docker-image.sh <dockerhub-username>
set -e

USERNAME="${1:?Usage: $0 <dockerhub-username>}"

docker build -t "${USERNAME}/inventory-api:latest" ./backend
docker push "${USERNAME}/inventory-api:latest"

echo "Pushed to https://hub.docker.com/r/${USERNAME}/inventory-api"
