#!/bin/bash

rm -r build/ dist/ havenpy.egg-info/ || true

python setup.py sdist bdist_wheel