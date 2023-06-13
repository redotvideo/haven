import transformers
from transformers import TextIteratorStreamer
from threading import Thread
import torch

from worker.models.base_causal import AutoCausalModel


class Falcon7BModel(AutoCausalModel):
        
    def __init__(self, config):
        super().__init__(config)


    ##############################
    ### INFERENCE    #############
    ##############################
    def prepare_for_inference(self, int8_quantization: bool):
        self.model = transformers.AutoModelForCausalLM.from_pretrained(self.model_config["model_name"], device_map="auto", load_in_8bit=int8_quantization, trust_remote_code=True, torch_dtype=torch.bfloat16)
        self.tokenizer = transformers.AutoTokenizer.from_pretrained(self.model_config["model_name"])

    def generate_stream(self, text_input: str, sample: bool = True, top_p: float = 0.8, top_k: int = 500, temperature: float = 0.9, max_length: int = 2048):
        return super().generate_stream(text_input, sample, top_p, top_k, temperature, max_length)