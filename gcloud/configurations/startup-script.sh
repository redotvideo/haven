#!/bin/bash

# Check if start up script has already been run
if [ ! -f /tmp/startup_complete ]; then
	# Install nvidia driver
 	sudo /opt/deeplearning/install-driver.sh

	sudo apt-get update	
	sudo apt-get install -y docker.io

	# Download docker image from url
	sudo wget "{download_url}" -O /tmp/docker_image.tar

	# Load docker image
	sudo docker load -i /tmp/docker_image.tar

	# Run docker image
	docker run -it -v /usr/local/nvidia:/usr/local/nvidia --gpus all -p 5001:5001 my-image
  
	# Create the indicator file
	touch /tmp/startup_complete
fi
