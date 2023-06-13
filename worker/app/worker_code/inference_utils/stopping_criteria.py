from transformers import StoppingCriteria
import torch

class StopOnTokens(StoppingCriteria):
    def __init__(self, tokenizer, stop_token_list):
        super(StopOnTokens, self).__init__()
        self.stopping_ids = tokenizer.convert_tokens_to_ids(stop_token_list)

    def __call__(self, input_ids: torch.LongTensor, scores: torch.FloatTensor, **kwargs) -> bool:
        for stop_id in self.stopping_ids:
            if input_ids[0][-1] == stop_id:
                return True
        return False
