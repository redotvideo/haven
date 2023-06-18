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
        self.model_engine.prepare_for_inference(self.config["int8"])
        

    def generate(self, text_input, **kwargs):
        return self.model_engine.generate_stream(text_input, **kwargs)

        

if __name__ == '__main__':
    client = InferenceClient("models/model_configs/mpt_chat_7b_newconfig_inference.json")

    PROMPT = "Hey! What is a large language model?"
    
    import time
    import torch
    start = time.time()

    #with torch.autocast('cuda'):
    stream = client.generate(PROMPT)
    for s in stream:
        print(s)
    end = time.time()

    print("total", end-start)
