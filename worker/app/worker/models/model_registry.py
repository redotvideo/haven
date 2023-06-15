
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

from models.base_causal import AutoCausalModel
from models.mpt import MPTModel
from models.falcon_7b import Falcon7BModel

print(ModelRegistry.REGISTRY)
