from typing import List
from .vllm_causal import VllmCausalModel

from vllm.engine.arg_utils import AsyncEngineArgs
from vllm.engine.async_llm_engine import AsyncLLMEngine
from vllm.sampling_params import SamplingParams
from vllm.utils import random_uuid


class Llama13B(VllmCausalModel):

    architecture_name = "llama_13b"

    def __init__(self, config):
        super().__init__(config)


    ##############################
    ### INFERENCE    #############
    ##############################
    def prepare_for_inference(self):
        if self.model_config["quantization"] == "int8":
            raise NotImplementedError("VLLM Models do not yet support 8bit-quantization.")


        elif self.model_config["quantization"] == "float16":
            engine_args = AsyncEngineArgs(model=self.model_config["huggingface_name"], engine_use_ray=True, tokenizer_mode="slow")
            self.model_vllm_engine = AsyncLLMEngine.from_engine_args(engine_args)

        else:
            raise NotImplementedError(f"{self.model_config['quantization']} is not a valid quantization config")


    async def generate_stream(self, messages: List, max_tokens: int = 2048, top_p=0.8, top_k=500, temperature=0.9):
        stream = super().generate_stream(messages, max_tokens=max_tokens, top_p=top_p, top_k=top_k, temperature=temperature)
        async for text in stream:
            yield text