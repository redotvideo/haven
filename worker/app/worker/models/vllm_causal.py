import transformers
from transformers import TextIteratorStreamer, StoppingCriteriaList, Trainer, TrainingArguments
from threading import Thread
from typing import List
from peft import LoraConfig, prepare_model_for_int8_training, get_peft_model
import re

from app.pb import worker_pb2, worker_pb2_grpc

from vllm.engine.arg_utils import AsyncEngineArgs
from vllm.engine.async_llm_engine import AsyncLLMEngine
from vllm.sampling_params import SamplingParams
from vllm.utils import random_uuid

from .model_registry import RegisteredModel
from .inference_utils.stopping_criteria import StopOnTokens
from .training_utils.tokenizer_resize import resize_tokenizer_and_embeddings
from .training_utils.data_processing import make_supervised_data_module


class VllmCausalModel(RegisteredModel):

    architecture_name = "causal_vllm_model"

    def __init__(self, config):
        self.model_config = config

        if config["name"].startswith("@huggingface"):
            self.model_config["huggingface_name"] = "/".join(config["name"].split("/")[1:])



    ##############################
    ### INFERENCE    #############
    ##############################
    def prepare_for_inference(self):
        if self.model_config["quantization"] == "int8":
            raise NotImplementedError("VLLM Models do not yet support 8bit-quantization.")


        elif self.model_config["quantization"] == "float16":
            engine_args = AsyncEngineArgs(model=self.model_config["huggingface_name"], engine_use_ray=True)

            self.model_vllm_engine = AsyncLLMEngine.from_engine_args(engine_args)

        else:
            raise NotImplementedError(f"{self.model_config['quantization']} is not a valid quantization config")


    async def generate_stream(self, messages: List, max_tokens: int = 2048, top_p=0.8, top_k=500, temperature=0.9):
        prompt = self.create_prompt_from_messages(messages)

        sampling_params = SamplingParams(
                max_tokens=max_tokens if max_tokens < self.model_config["contextSize"] else self.model_config["contextSize"],
                top_p=1 if temperature==0 else top_p, 
                temperature=temperature, 
                stop=self.get_stopword_list()
            )
        
        id = random_uuid()
        results_generator = self.model_vllm_engine.generate(prompt, sampling_params, id)
        
        prev_text = ""
        async for request_output in results_generator:
            text = request_output.outputs[0].text
            text = text.replace(prev_text, "")
            prev_text += text
            yield text


    def create_prompt_from_messages(self, messages):
        if messages[-1].role == worker_pb2.ASSISTANT:
            raise Exception("Last message should be from user, not assistant")
                
        prompt = self.model_config["systemPrompt"]
        for message_obj in messages:
            if message_obj.role == worker_pb2.USER:
                prompt += self.model_config["instructionPrefix"] + message_obj.content + self.model_config["instructionPostfix"]

            elif message_obj.role == worker_pb2.ASSISTANT:
                prompt += self.model_config["outputPrefix"] + message_obj.content + self.model_config["outputPostfix"]

        prompt += self.model_config["outputPrefix"]

        return prompt
    

    def get_stopword_list(self, input_str):
        if all(char.isspace() for char in self.model_config["outputPostfix"]):
            return [self.model_config["instructionPrefix"].strip()]
        else:
            return [self.model_config["outputPostfix"].strip()]
            

    ##############################
    ### FINETUNING   #############
    ##############################
    def prepare_model_for_training(self):

        self.model = transformers.AutoModelForCausalLM.from_pretrained(self.model_config["huggingface_name"], device_map="auto", load_in_8bit=self.model_config["lora"])
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
        self.train_dataset, self.collator = make_supervised_data_module(tokenizer=self.tokenizer, data_path=self.model_config["train_data_path"], instruction_prefix=self.model_config["instructionPrefix"], output_prefix=self.model_config["outputPrefix"])
        self.eval_dataset, _ = make_supervised_data_module(tokenizer=self.tokenizer, data_path=self.model_config["eval_data_path"], instruction_prefix=self.model_config["instructionPrefix"], output_prefix=self.model_config["outputPrefix"])




    def train(self):


        training_args = TrainingArguments(learning_rate=self.model_config["learning_rate"], per_device_train_batch_size=self.model_config["batch_size"], per_device_eval_batch_size=self.model_config["batch_size"], output_dir="out")

        trainer = Trainer(
            model=self.model, 
            tokenizer=self.tokenizer,
            train_dataset=self.train_dataset, 
            eval_dataset=self.eval_dataset,
            data_collator=self.collator,
            args=training_args
        )

        trainer.train()

        self.model.save_pretrained(self.model_config["trained_model_path"])
        self.tokenizer.save_pretrained(self.model_config["trained_model_path"])