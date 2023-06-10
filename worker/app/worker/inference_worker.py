import transformers
from transformers import StoppingCriteria, StoppingCriteriaList, TextIteratorStreamer
import torch
import json
from threading import Thread
from typing import List

from worker.model_registry import ModelRegistry
from worker.inference_utils.stopping_criteria import StopOnTokens



class InferenceClient:
    def __init__(self, config):

        with open(config, 'r') as f:
            self.config = json.load(f)

        self.model_engine = ModelRegistry.REGISTRY[self.config["user_config"]["base_class"]](self.config["model_config"])
        self.model_engine.prepare_for_inference(int8_quantization=self.config["8bit"])
        

    def generate(self, text_input, **kwargs):
        self.model_engine.generate(text_input, **kwargs)

        