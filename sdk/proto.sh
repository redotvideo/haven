#!/bin/bash

# To be called from the root of the project

# Generates proto files
pip install grpcio-tools==1.51.1 mypy-protobuf==3.4.0 'types-protobuf>=3.20.4'

rm -r ./haven/pb || true
mkdir -p ./haven/pb

python -m grpc_tools.protoc -I../proto \
		--python_out=./haven/pb \
		--mypy_out=./haven/pb \
		--grpc_python_out=./haven/pb ../proto/manager.proto

find haven/pb/ -type f -name "*.py" -print0 -exec sed -i -e 's/^\(import.*pb2\)/from . \1/g' {} \;
touch haven/pb/__init__.py