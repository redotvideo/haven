#!/bin/bash
sudo apt-get update	
sudo apt-get install -y docker.io

# Download docker image from url
sudo wget "{download_url}" -O /tmp/docker_image.tar

# Load docker image
sudo docker load -i /tmp/docker_image.tar

# Run docker image
# For graphics, add --gpus all 
sudo docker run -d -p 5001:5001 my-image