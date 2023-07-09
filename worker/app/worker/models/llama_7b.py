import os
from transformers import AutoModelForCausalLM, AutoTokenizer
from typing import List
from .vllm_causal import VllmCausalModel

from vllm.engine.arg_utils import AsyncEngineArgs
from vllm.engine.async_llm_engine import AsyncLLMEngine


class Llama7B(VllmCausalModel):

    architecture_name = "llama_7b"

    def __init__(self, config):
        super().__init__(config)


    ##############################
    ### INFERENCE    #############
    ##############################
    def prepare_for_inference(self):

        if not os.path.exists("local_model/tokenizer.json"): # Download Model before starting server

            model_local = AutoModelForCausalLM.from_pretrained(self.model_config["huggingface_name"], trust_remote_code=True)
            model_local.save_pretrained("local_model")
            tokenizer = AutoTokenizer.from_pretrained(self.model_config["huggingface_name"])
            tokenizer.save_pretrained("local_model")
            del model_local
            del tokenizer

        if self.model_config["quantization"] == "int8":
            raise NotImplementedError("VLLM Models do not yet support 8bit-quantization.")


        elif self.model_config["quantization"] == "float16":
            if self.model_config["gpuCount"] == "T4":
                engine_args = AsyncEngineArgs(model=self.model_config["huggingface_name"], trust_remote_code=True, tokenizer_mode="slow", tensor_parallel_size=self.model_config["gpuCount"], dtype="float16")

            elif self.model_config["gpuCount"] == "A100":
                engine_args = AsyncEngineArgs(model=self.model_config["huggingface_name"], trust_remote_code=True, tokenizer_mode="slow", tensor_parallel_size=self.model_config["gpuCount"])
            
            self.model_vllm_engine = AsyncLLMEngine.from_engine_args(engine_args)

        else:
            raise NotImplementedError(f"{self.model_config['quantization']} is not a valid quantization config")


    async def generate_stream(self, messages: List, max_tokens: int = 2048, top_p=0.8, top_k=500, temperature=0.9):
        stream = super().generate_stream(messages, max_tokens=max_tokens, top_p=top_p, top_k=top_k, temperature=temperature)
        async for text in stream:
            yield text