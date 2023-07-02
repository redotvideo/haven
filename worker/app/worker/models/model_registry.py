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
from .mpt import MPTModel
from .falcon_7b import Falcon7BModel
from .vllm_causal import VllmCausalModel