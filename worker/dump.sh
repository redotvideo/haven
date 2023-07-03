#!/bin/bash

# Builds docker image for all platforms and saves it to a tar file
docker buildx build --platform=linux/amd64 -t havenhq/worker:latest . 
docker push havenhq/worker:latest