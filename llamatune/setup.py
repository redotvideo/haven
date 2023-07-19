from setuptools import setup, find_packages

setup(
    name='haven_tuning',
    version='0.1.0',
    author='Haven Technologies Inc.',
    author_email='hello@havenllm.com',
    description="Haven\'s Tuning Library for LLM finetuning",
    packages=find_packages(),
    install_requires=[
        'torch==2.0.1',
        'transformers==4.31.0',
        'bitsandbytes==0.40.2',
        'einops==0.6.1',
        'evaluate==0.4.0',
        'scikit-learn==1.2.2',
        'sentencepiece==0.1.99',
        'wandb==0.15.3',
        'peft==0.4.0',
        'accelerate==0.21.0'
    ],

)

