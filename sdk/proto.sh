#!/bin/bash

# Generates proto files
pip install grpcio-tools==1.51.1 mypy-protobuf==3.4.0 'types-protobuf>=3.20.4'

rm -r ./havenclient/pb || true
mkdir -p ./havenclient/pb

python -m grpc_tools.protoc -I../proto \
		--python_out=./havenclient/pb \
		--mypy_out=./havenclient/pb \
		--grpc_python_out=./havenclient/pb ../proto/manager.proto

find havenclient/pb/ -type f -name "*.py" -print0 -exec sed -i -e 's/^\(import.*pb2\)/from . \1/g' {} \;
touch havenclient/pb/__init__.py