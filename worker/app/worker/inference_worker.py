import transformers
from transformers import StoppingCriteria, StoppingCriteriaList, TextIteratorStreamer
import torch
import json
from threading import Thread
from typing import List

from .models.model_registry import ModelRegistry



class InferenceClient:
    def __init__(self, config):

        with open(config, 'r') as f:
            self.config = json.load(f)

        self.model_engine = ModelRegistry.REGISTRY[self.config["architecture"]](self.config)
        self.model_engine.prepare_for_inference()

    def complete_chat(self, messages, inference_params):
        return self.model_engine.generate_stream(messages, **inference_params)

    