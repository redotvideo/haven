#!/bin/bash

# Generates proto files
pip install grpcio-tools==1.51.1 mypy-protobuf==3.4.0 'types-protobuf>=3.20.4'

rm -r ./havenpy/pb || true
mkdir -p ./havenpy/pb

python -m grpc_tools.protoc -I../proto \
		--python_out=./havenpy/pb \
		--mypy_out=./havenpy/pb \
		--grpc_python_out=./havenpy/pb ../proto/manager.proto

find havenpy/pb/ -type f -name "*.py" -print0 -exec sed -i -e 's/^\(import.*pb2\)/from . \1/g' {} \;
touch havenpy/pb/__init__.py