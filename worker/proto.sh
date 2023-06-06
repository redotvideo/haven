#!/bin/bash

# To be called from the root of the project

# Generates proto files
pip install grpcio-tools==1.51.1 mypy-protobuf==3.4.0 'types-protobuf>=3.20.4'

rm -r ./worker/app/pb || true
mkdir -p ./worker/app/pb

python -m grpc_tools.protoc -I./proto \
		--python_out=./worker/app/pb \
		--mypy_out=./worker/app/pb \
		--grpc_python_out=./worker/app/pb ./proto/worker.proto

find worker/app/pb/ -type f -name "*.py" -print0 -exec sed -i -e 's/^\(import.*pb2\)/from . \1/g' {} \;
touch worker/app/pb/__init__.py