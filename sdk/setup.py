from setuptools import setup, find_packages

setup(
    name='havenpy',
    version='0.2.0',
    author='Haven Technologies Inc.',
    author_email='hello@havenllm.com',
    description='Haven SDK',
    packages=find_packages(),
    install_requires=[
        'grpcio==1.54.2',
        'protobuf==4.23.3'
    ],
)
