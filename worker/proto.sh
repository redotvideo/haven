#!/bin/bash

# Generates proto files
pip install grpcio-tools==1.51.1 mypy-protobuf==3.4.0 'types-protobuf>=3.20.4'

rm -r ./app/server
mkdir -p ./app/server

python -m grpc_tools.protoc -I../proto \
		--python_out=./app/server \
		--mypy_out=./app/server \
		--grpc_python_out=./app/server ../proto/worker.proto

find app/server/ -type f -name "*.py" -print0 -exec sed -i -e 's/^\(import.*pb2\)/from . \1/g' {} \;
touch app/server/__init__.py