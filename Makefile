
generate-proto:
	cd manager && npm run proto
	cd worker && ./proto.sh
	cd ui && npm run proto
	cd sdk && ./proto.sh

build-docker:
	docker buildx build --platform=linux/amd64 -t konsti1/peacefulplace:2023.06.10.2 . 
