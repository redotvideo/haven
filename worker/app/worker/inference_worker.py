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

        self.model_engine = ModelRegistry.REGISTRY[self.config["architecture_name"]](self.config)
        self.model_engine.prepare_for_inference()

    def generate(self, text_input, conversation_history=None, **kwargs):
        return self.model_engine.generate_stream(text_input, conversation_history, **kwargs)

        

if __name__ == '__main__':

    client = InferenceClient("models/model_configs/mpt_chat_7b_newconfig.json")

    history = [
        {"role": "user", "content": "Hey. I want to surprise my friend with a small trip! Which countries could I visit with her?"},
        {"role": "assistant", "content": "There are many nice countries you could visit. Which kinds of activities does your friend like?"},
    ]

    stream = client.generate("She likes the mountains, particularly skiing.", conversation_history=history)
    for s in stream:
        print(s)
