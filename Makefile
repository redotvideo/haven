
generate-proto:
	cd manager && npm run proto
	cd worker && ./proto.sh
	cd sdk && ./proto.sh

build-docker:
	docker buildx build --platform=linux/amd64 -t havenhq/haven:latest . 
