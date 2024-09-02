
#!/bin/bash
# Clear terminal screen
clear
# Building docker image
docker image build -t bomberman-dom .
# Run a command in a new container and get the container ID
CONTAINER_ID=$(docker container run -p 3000:3000 -d bomberman-dom)
# Display the container ID
echo "Container ID: $CONTAINER_ID"
# Prompt user for cleanup
read -p "Open http://localhost:3000 to visit the game. When you are finished, then press Enter to run delete_docker script"
# Run the cleanup script passing the container ID
./docker_delete.sh "$CONTAINER_ID"