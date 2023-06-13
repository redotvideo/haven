import os
import sys
sys.path = sys.path + [os.path.join(os.path.dirname(__file__), "..", "..")]


class ModelRegistry(type):

    REGISTRY = {}

    def __new__(cls, name, bases, attrs):
        # instantiate a new type corresponding to the type of class being defined
        # this is currently RegisterBase but in child classes will be the child class

        new_cls = type.__new__(cls, name, bases, attrs)
        cls.REGISTRY[new_cls.__name__] = new_cls
        return new_cls

    @classmethod
    def get_registry(cls):
        return dict(cls.REGISTRY)
    

class RegisteredModel(metaclass=ModelRegistry):
    pass


# REGISTER ALL MODELS

from worker_code.models.base_causal import AutoCausalModel
from worker.models.mpt import MPTModel
from worker.models.falcon_7b import Falcon7BModel
