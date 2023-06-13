import transformers
from transformers import StoppingCriteria, StoppingCriteriaList, TextIteratorStreamer
import torch
import json
from threading import Thread
from typing import List

from models.model_registry import ModelRegistry



class InferenceClient:
    def __init__(self, config):

        with open(config, 'r') as f:
            self.config = json.load(f)

        self.model_engine = ModelRegistry.REGISTRY[self.config["base_class"]](self.config)
        self.model_engine.prepare_for_inference(int8_quantization=self.config["int8"])
        

    def generate(self, text_input, **kwargs):
        return self.model_engine.generate(text_input, **kwargs)

        

if __name__ == '__main__':
    client = InferenceClient("models/model_configs/mpt_chat_7b_newconfig.json")
    stream = client.generate("Hey!! How are you doing?")
    for s in stream:
        print(s)
