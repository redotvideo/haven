import transformers
from transformers import TextIteratorStreamer, StoppingCriteriaList
from threading import Thread
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


    def generate_stream(self, text_input: str, sample: bool = True, top_p: float = 0.8, top_k: int = 500, temperature: float = 0.9, max_length: int = 2048):
        adapted_text_input = self.model_config["instruction_prefix"] + text_input + self.model_config["output_prefix"]
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
    



    ##############################
    ### FINETUNING   #############
    ##############################
    def prepare_for_finetuning(self, lora: bool):
        raise NotImplementedError


    def train():
        raise NotImplementedError

    
