class ModelRegistry(type):

    REGISTRY = {}

    def __new__(cls, name, bases, attrs):
        # instantiate a new type corresponding to the type of class being defined
        # this is currently RegisterBase but in child classes will be the child class

        new_cls = type.__new__(cls, name, bases, attrs)
        cls.REGISTRY[new_cls.architecture_name] = new_cls
        return new_cls

    @classmethod
    def get_registry(cls):
        return dict(cls.REGISTRY)
    

class RegisteredModel(metaclass=ModelRegistry):

    architecture_name = "model"


# REGISTER ALL MODELS

from .base_causal import AutoCausalModel
from .bigcode_15b import BigCode15B
from .falcon_7b import Falcon7BModel
from .gpt_neox_3b import GPTNeoX3B
from .gpt_neox_7b import GPTNeoX7B
from .gpt_neox_12b import GPTNeoX12B
from .llama_7b import Llama7B
from .llama_13b import Llama13B
from .mpt_7b import Mpt7B
from .mpt_30b import Mpt30B
from .vllm_causal import VllmCausalModel
