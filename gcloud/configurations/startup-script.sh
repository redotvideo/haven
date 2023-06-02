#!/bin/bash

# Check if start up script has already been run
if [ ! -f /tmp/startup_complete ]; then
	sudo apt-get update	
	sudo apt-get install -y docker.io

	# Download docker image from url
	sudo wget "{download_url}" -O /tmp/docker_image.tar

	# Load docker image
	sudo docker load -i /tmp/docker_image.tar

	# Run docker image
	# For graphics, add --gpus all 
	sudo docker run -d -p 5001:5001 --restart unless-stopped my-image
  
	# Create the indicator file
	touch /tmp/startup_complete
fi
