#!/bin/bash

# Check if start up script has already been run
if [ ! -f ~/startup_complete ]; then
	# Install nvidia driver
 	sudo /opt/deeplearning/install-driver.sh

	sudo apt-get update	
	sudo apt-get install -y docker.io

	# Download config file from url
	wget "{config_url}" -O ~/config.json

	# Pull docker image
	docker pull -t my-image "{image_url}"

	# Run docker image and mount the config.json
	docker run -d \
		-v /usr/local/nvidia:/usr/local/nvidia \
		-v ~/config.json:/app/config.json \
		--restart always \
		--gpus all -p 50051:50051 my-image
  
	# Create the indicator file
	touch ~/startup_complete
fi
