#!/bin/bash

# Generates proto files
pip install grpcio-tools==1.51.1 mypy-protobuf==3.4.0 'types-protobuf>=3.20.4'

rm -r ./havenllm/pb || true
mkdir -p ./havenllm/pb

python -m grpc_tools.protoc -I../proto \
		--python_out=./havenllm/pb \
		--mypy_out=./havenllm/pb \
		--grpc_python_out=./havenllm/pb ../proto/manager.proto

find havenllm/pb/ -type f -name "*.py" -print0 -exec sed -i -e 's/^\(import.*pb2\)/from . \1/g' {} \;
touch havenllm/pb/__init__.py