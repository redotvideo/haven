#!/bin/bash

# Generates proto files
pip install grpcio-tools==1.51.1 mypy-protobuf==3.4.0 'types-protobuf>=3.20.4'

rm -r ./app/pb || true
mkdir -p ./app/pb

python -m grpc_tools.protoc -I../proto \
		--python_out=./app/pb \
		--mypy_out=./app/pb \
		--grpc_python_out=./app/pb ../proto/worker.proto

find ./app/pb/ -type f -name "*.py" -print0 -exec sed -i -e 's/^\(import.*pb2\)/from . \1/g' {} \;
touch app/pb/__init__.py