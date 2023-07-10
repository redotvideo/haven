from typing import List
from .vllm_causal import VllmCausalModel


class GPTNeoX12B(VllmCausalModel):

    architecture_name = "gpt_neox_12b"

    def __init__(self, config):
        super().__init__(config)


    ##############################
    ### INFERENCE    #############
    ##############################
    def prepare_for_inference(self):
        super().prepare_for_inference()


    async def generate_stream(self, prompt: str, stop_tokens = [], max_tokens: int = 2048, top_p=0.8, top_k=500, temperature=0.9):
        stream = super().generate_stream(prompt, stop_tokens=[], max_tokens=max_tokens, top_p=top_p, top_k=top_k, temperature=temperature)
        async for text in stream:
            yield text
