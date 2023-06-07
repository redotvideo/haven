
generate-proto:
	cd manager && npm run proto
	cd worker && ./proto.sh
	cd ui && npm run proto
	cd sdk && ./proto.sh
