#!/bin/bash

# Check if start up script has already been run
if [ ! -f ~/startup_complete ]; then
	# Install nvidia driver
 	sudo /opt/deeplearning/install-driver.sh

	sudo apt-get update	
	sudo apt-get install -y docker.io

	echo '{config}' > ~/config.json

	# Pull docker image
	docker pull "{image_url}"

	# Run docker image and mount the config.json
	docker run -d \
		-v /usr/local/nvidia:/usr/local/nvidia \
		-v ~/config.json:/app/config.json \
		--restart always \
		--gpus all --shm-size=10.24gb \
		-p 50051:50051 {image_url}
  
	# Create the indicator file
	touch ~/startup_complete
fi
