import transformers
from transformers import TextIteratorStreamer, StoppingCriteriaList
from threading import Thread
import torch
import deepspeed
from typing import List
from peft import LoraConfig, prepare_model_for_int8_training, get_peft_model

from .base_causal import AutoCausalModel
from .training_utils.tokenizer_resize import resize_tokenizer_and_embeddings
from .training_utils.data_processing import make_supervised_data_module
from .inference_utils.stopping_criteria import StopOnTokens

class MPTModel(AutoCausalModel):
        
    def __init__(self, config):
        super().__init__(config)


    ##############################
    ### INFERENCE    #############
    ##############################
    def prepare_for_inference(self):
        if self.model_config["int8"]:
            raise NotImplementedError("MPT Models do not yet support 8bit-quantization. We're working on it!")
        
        hf_model_config = transformers.AutoConfig.from_pretrained(self.model_config["model_name"], trust_remote_code=True, low_cpu_mem_usage=True, torch_dtype=torch.bfloat16)
        hf_model_config.update({"max_seq_len": 28000})
        self.model = transformers.AutoModelForCausalLM.from_pretrained(self.model_config["model_name"], trust_remote_code=True, low_cpu_mem_usage=True, torch_dtype=torch.bfloat16, config=hf_model_config).to('cuda')

        if self.model_config["gpu_type"] == "A100" and self.model_config["gpu_count"] == 1:
            self.model = deepspeed.init_inference(self.model, mp_size=1, replace_with_kernel_inject=True, replace_method="auto")

        self.tokenizer = transformers.AutoTokenizer.from_pretrained(self.model_config["model_name"])
        self.stopping_criteria = StoppingCriteriaList([StopOnTokens(self.tokenizer, self.model_config["stop_tokens"]+[self.tokenizer.eos_token])])


    def generate_stream(self, text_input: str, conversation_history: List, sample: bool = True, top_p: float = 0.8, top_k: int = 500, temperature: float = 0.9, max_length: int = 2048):
        return super().generate_stream(text_input, conversation_history, sample, top_p, top_k, temperature, max_length)
    



    ##############################
    ### INFERENCE    #############
    ##############################
    def prepare_model_for_training(self):
        self.model = transformers.AutoModelForCausalLM.from_pretrained(self.model_config["model_name"], device_map="auto", low_cpu_mem_usage=True, trust_remote_code=True, torch_dtype=torch.bfloat16)
        self.tokenizer = transformers.AutoTokenizer.from_pretrained(self.model_config["model_name"])

        if self.tokenizer.pad_token is None:
            resize_tokenizer_and_embeddings(
                tokenizer=self.tokenizer,
                model=self.model,
            )

        if self.model_config["lora"]:
            lora_config = LoraConfig(r=16, lora_alpha=32, target_modules=self.model_config["lora_params"], lora_dropout=0.05, bias="none", task_type="CAUSAL_LM")
            self.model = get_peft_model(self.model, lora_config)


    def prepare_data_for_training(self):
        super().prepare_data_for_training()

    def train(self):
        super().train()
