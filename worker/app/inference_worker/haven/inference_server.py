import transformers
from transformers import StoppingCriteria, StoppingCriteriaList, TextIteratorStreamer
import torch
import json
from threading import Thread

class StopOnTokens(StoppingCriteria):
    def __init__(self, tokenizer, stop_token_list):
        super(StopOnTokens, self).__init__()
        self.stopping_ids = tokenizer.convert_tokens_to_ids(stop_token_list)

    def __call__(self, input_ids: torch.LongTensor, scores: torch.FloatTensor, **kwargs) -> bool:
        for stop_id in self.stopping_ids:
            if input_ids[0][-1] == stop_id:
                return True
        return False

class InferenceClient:
    def __init__(self, config, setup_type="T4_8bit"):

        with open(config, 'r') as f:
            config = json.load(f)


        self.model_config = config["model_config"]
        self.inference_config = config["inference_config"][setup_type]

        # ALL THINGS LLM
        self.generative_llm_tokenizer = transformers.AutoTokenizer.from_pretrained(self.model_config["tokenizer_name"])
        self.llm_stopping_criteria = StoppingCriteriaList([StopOnTokens(self.generative_llm_tokenizer, self.model_config["stop_tokens"]+[self.generative_llm_tokenizer.eos_token])])

        self.generative_llm_config = transformers.AutoConfig.from_pretrained(self.model_config["model_name"], **self.inference_config["initialization_args"])
        self.generative_llm_config.update({"max_seq_len": self.model_config["context_size"]})
        self.generative_llm = transformers.AutoModelForCausalLM.from_pretrained(self.model_config["model_name"],
            torch_dtype=getattr(torch, self.model_config["dtype"]),
            config=self.generative_llm_config,
            **self.inference_config["initialization_args"]
            #**self.inference_config["initialization_args"]
        )

        #self.generative_llm.config.update({"max_seq_len": self.model_config["context_size"]})
        
        if "device_map" not in self.inference_config["initialization_args"].keys():
            self.generative_llm = self.generative_llm.to('cuda')

    def generate(self, text_input, sample=True, top_p=0.8, top_k=100, temperature=0.8, max_length=300):
        adapted_text_input = self.model_config["instruction_prefix"] + text_input + self.model_config["output_prefix"]
        input_tokenized = self.generative_llm_tokenizer.encode(adapted_text_input, return_tensors='pt').to('cuda')
        output = self.generative_llm.generate(input_tokenized, do_sample=sample, max_new_tokens=max_length, top_p=top_p, top_k=top_k, temperature=temperature, stopping_criteria=self.llm_stopping_criteria)

        output_text = self.generative_llm_tokenizer.decode(output[0][len(input_tokenized[0]):], skip_special_tokens=True)

        return output_text
    
    def generate_stream(self, text_input, sample=True, top_p=0.8, top_k=100, temperature=0.8, max_length=300):
        adapted_text_input = self.model_config["instruction_prefix"] + text_input + self.model_config["output_prefix"]
        input_tokenized = self.generative_llm_tokenizer([adapted_text_input], return_tensors='pt').input_ids.to('cuda')


        streamer = TextIteratorStreamer(self.generative_llm_tokenizer, skip_prompt=True)

        generation_kwargs=dict(
            inputs=input_tokenized,
            streamer=streamer,
            do_sample=sample, 
            max_new_tokens=max_length, 
            top_p=top_p, 
            top_k=top_k, 
            temperature=temperature, 
            stopping_criteria=self.llm_stopping_criteria
        )

        thread = Thread(target=self.generative_llm.generate, kwargs=generation_kwargs)
        thread.start()

        return streamer
