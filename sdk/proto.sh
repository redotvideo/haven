#!/bin/bash

# To be called from the root of the project

# Generates proto files
pip install grpcio-tools==1.51.1 mypy-protobuf==3.4.0 'types-protobuf>=3.20.4'

rm -r ./sdk/haven/pb || true
mkdir -p ./sdk/haven/pb

python -m grpc_tools.protoc -I./proto \
		--python_out=./sdk/haven/pb \
		--mypy_out=./sdk/haven/pb \
		--grpc_python_out=./sdk/haven/pb ./proto/manager.proto

find sdk/haven/pb/ -type f -name "*.py" -print0 -exec sed -i -e 's/^\(import.*pb2\)/from . \1/g' {} \;
touch sdk/haven/pb/__init__.py