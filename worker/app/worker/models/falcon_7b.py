import transformers
from transformers import TextIteratorStreamer, StoppingCriteriaList
from threading import Thread
import torch
import deepspeed
from peft import LoraConfig, prepare_model_for_int8_training, get_peft_model
from typing import List

from .base_causal import AutoCausalModel
from .training_utils.tokenizer_resize import resize_tokenizer_and_embeddings
from .training_utils.data_processing import make_supervised_data_module
from .inference_utils.stopping_criteria import StopOnTokens

class Falcon7BModel(AutoCausalModel):

    architecture_name = "falcon_7b"
        
    def __init__(self, config):
        super().__init__(config)


    ##############################
    ### INFERENCE    #############
    ##############################
    def prepare_for_inference(self):
        if self.model_config["quantization"] == "int8":
            self.model = transformers.AutoModelForCausalLM.from_pretrained(self.model_config["huggingface_name"], device_map="auto", load_in_8bit=True, trust_remote_code=True, torch_dtype=torch.bfloat16)

        elif self.model_config["quantization"] == "float16":
            self.model = transformers.AutoModelForCausalLM.from_pretrained(self.model_config["huggingface_name"], device_map="auto", trust_remote_code=True, torch_dtype=torch.bfloat16)

            if self.model_config["gpuType"] == "A100" and self.model_config["gpuCount"] == 1:
                self.model = deepspeed.init_inference(self.model, mp_size=1, replace_with_kernel_inject=True, replace_method="auto")

        else:
            raise NotImplementedError(f"{self.model_config['quantization']} is not a valid quantization config")


        self.tokenizer = transformers.AutoTokenizer.from_pretrained(self.model_config["huggingface_name"])
        self.stopping_criteria = StoppingCriteriaList([StopOnTokens(self.tokenizer, [self.model_config["stopTokens"]]+[self.tokenizer.eos_token])])

        
    def generate_stream(self, messages: List, sample: bool = True, top_p: float = 0.8, top_k: int = 500, temperature: float = 0.9, max_length: int = 2048):
        return super().generate_stream(messages, sample, top_p, top_k, temperature, max_length)


    ##############################
    ### INFERENCE    #############
    ##############################
    def prepare_model_for_training(self):
        self.model = transformers.AutoModelForCausalLM.from_pretrained(self.model_config["huggingface_name"], device_map="auto", load_in_8bit=self.model_config["lora"], trust_remote_code=True, torch_dtype=torch.bfloat16)
        self.tokenizer = transformers.AutoTokenizer.from_pretrained(self.model_config["huggingface_name"])

        if self.tokenizer.pad_token is None:
            resize_tokenizer_and_embeddings(
                tokenizer=self.tokenizer,
                model=self.model,
            )

        if self.model_config["lora"]:
            lora_config = LoraConfig(r=16, lora_alpha=32, target_modules=self.model_config["lora_params"], lora_dropout=0.05, bias="none", task_type="CAUSAL_LM")
            self.model = prepare_model_for_int8_training(self.model)
            self.model = get_peft_model(self.model, lora_config)


    def prepare_data_for_training(self):
        super().prepare_data_for_training()

    def train(self):
        super().train()