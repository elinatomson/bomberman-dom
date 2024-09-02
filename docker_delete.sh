#!/bin/bash
# Get the container ID passed as an argument
CONTAINER_ID="$1"
IMAGE_NAME="bomberman-dom"
# Stop the container
docker container stop "$CONTAINER_ID"
# Remove the specific container
docker container rm "$CONTAINER_ID"
# Remove the specified image
docker image rm "$IMAGE_NAME"