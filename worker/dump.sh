#!/bin/bash

# Builds docker image for all platforms and saves it to a tar file
docker buildx build --platform=linux/amd64 -t my-image . 
docker save my-image > ./worker-massive.tar