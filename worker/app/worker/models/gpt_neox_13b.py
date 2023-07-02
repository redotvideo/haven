from typing import List
from .vllm_causal import VllmCausalModel


class GPTNeoX13B(VllmCausalModel):

    architecture_name = "gpt_neox_13b"

    def __init__(self, config):
        super().__init__(config)


    ##############################
    ### INFERENCE    #############
    ##############################
    def prepare_for_inference(self):
        super().prepare_for_inference()


    async def generate_stream(self, messages: List, top_p: float = 0.8, top_k: int = 500, temperature: float = 0.9, max_length: int = 8000):
        stream = super().generate_stream(messages, top_p, top_k, temperature, max_length)
        async for text in stream:
            yield text
