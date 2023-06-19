import transformers
from transformers import TextIteratorStreamer, StoppingCriteriaList
from threading import Thread
import torch
import deepspeed
from .inference_utils.stopping_criteria import StopOnTokens

from models.base_causal import AutoCausalModel


class Falcon7BModel(AutoCausalModel):
        
    def __init__(self, config):
        super().__init__(config)


    ##############################
    ### INFERENCE    #############
    ##############################
    def prepare_for_inference(self):
        self.model = transformers.AutoModelForCausalLM.from_pretrained(self.model_config["model_name"], device_map="auto", load_in_8bit=self.model_config["int8"], trust_remote_code=True, torch_dtype=torch.bfloat16)

        if self.model_config["gpu_type"] == "A100" and self.model_config["gpu_count"] == 1:
            self.model = deepspeed.init_inference(self.model, mp_size=1, replace_with_kernel_inject=True, replace_method="auto")

        self.tokenizer = transformers.AutoTokenizer.from_pretrained(self.model_config["model_name"])
        self.stopping_criteria = StoppingCriteriaList([StopOnTokens(self.tokenizer, self.model_config["stop_tokens"]+[self.tokenizer.eos_token])])

    def generate_stream(self, text_input: str, sample: bool = True, top_p: float = 0.8, top_k: int = 500, temperature: float = 0.9, max_length: int = 2048):
        return super().generate_stream(text_input, sample, top_p, top_k, temperature, max_length)
