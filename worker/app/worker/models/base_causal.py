import transformers
from transformers import TextIteratorStreamer, StoppingCriteriaList
from threading import Thread
from typing import List
from .model_registry import RegisteredModel
from .inference_utils.stopping_criteria import StopOnTokens


class AutoCausalModel(RegisteredModel):
        
    def __init__(self, config):

        self.model_config = config


    ##############################
    ### INFERENCE    #############
    ##############################
    def prepare_for_inference(self, int8_quantization: bool):
        self.model = transformers.AutoModelForCausalLM.from_pretrained(self.model_config["model_name"], device_map="auto", load_in_8bit=int8_quantization)
        self.tokenizer = transformers.AutoTokenizer.from_pretrained(self.model_config["model_name"])
        self.stopping_criteria = StoppingCriteriaList([StopOnTokens(self.tokenizer, self.model_config["stop_tokens"]+[self.tokenizer.eos_token])])


    def generate_stream(self, text_input: str, conversation_history: List, sample: bool = True, top_p: float = 0.8, top_k: int = 500, temperature: float = 0.9, max_length: int = 2048):
        if conversation_history is None:
            history_prompt = ""
        else:
            history_prompt = self.create_history_prompt(conversation_history)

        adapted_text_input = history_prompt + self.model_config["instruction_prefix"] + text_input + self.model_config["output_prefix"]
        input_tokenized = self.tokenizer([adapted_text_input], return_tensors='pt').input_ids.to('cuda')

        streamer = TextIteratorStreamer(self.tokenizer, skip_prompt=True, skip_special_tokens=True)

        generation_kwargs=dict(
            inputs=input_tokenized,
            streamer=streamer,
            do_sample=sample, 
            max_new_tokens=max_length, 
            top_p=top_p, 
            top_k=top_k, 
            temperature=temperature, 
            stopping_criteria=self.stopping_criteria
        )

        thread = Thread(target=self.model.generate, kwargs=generation_kwargs)
        thread.start()

        return streamer
    


    def create_history_prompt(self, conversation_history):
        prompt = ""
        for message_obj in conversation_history:
            if message_obj["role"] == "user":
                prompt += self.model_config["instruction_prefix"] + message_obj["content"] + self.model_config["output_prefix"]

            elif message_obj["role"] == "assistant":
                prompt += message_obj["content"] + self.model_config["stop_tokens"][0]


        return prompt



    



    ##############################
    ### FINETUNING   #############
    ##############################
    def prepare_for_finetuning(self, lora: bool):
        raise NotImplementedError


    def train():
        raise NotImplementedError

    
