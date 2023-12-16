import time
import torch
from datasets import load_dataset
from .dataset import ChatDataModule
from transformers import AutoModelForCausalLM, BitsAndBytesConfig, AutoTokenizer, TrainingArguments, Trainer, TrainerCallback
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer, DataCollatorForCompletionOnlyLM
import wandb
import os
from dataclasses import dataclass, field
from typing import List



@dataclass
class EngineTrainArguments(TrainingArguments):
    output_dir: str = field(
        default='./output', 
        metadata={"help": 'The output dir for logs and checkpoints'}
    )
    per_device_train_batch_size: int = field(
          default=1,
          metadata={"help": 'batch size'}
    )
    gradient_accumulation_steps: int = field(
          default=16,
          metadata={"help": 'gradient accumulation steps'}
    )
    logging_steps: int = field(
        default=3,
        metadata={"help": 'gradient accumulation steps'}
    )
    learning_rate: float = field(
          default=1e-4,
          metadata={"help": 'learning rate'}
    )
    num_train_epochs: int = field(
          default=3,
          metadata={"help": 'number of training epochs'}
    )
    report_to: str = field(
          default="wandb",
          metadata={"help": 'where to report training logs to'}
    )
    save_strategy: str = field(
          default="no",
          metadata={"help": 'model saving strategy'}
    )

@dataclass
class EngineConfig:
    hf_token: str = field(
        default="none",
        metadata={"help": 'huggingface token'}
    )
    wandb_token: str = field(
        default="none",
        metadata={"help": 'wandb token'}
    )
    default_conversation_template_id: str = field(
        default="meta-llama/Llama-2-7b-chat-hf",
        metadata={"help": 'which template to use if model does not have one'}
    )
    max_tokens: int = field(
        default=2700,
        metadata={"help": 'max sample length'}
    )
    callbacks: List = field(
        default=None
    )   



class ModelEngine:
    def __init__(self, model_name, dataset_name, training_args, engine_args):
        self.training_args = EngineTrainArguments(**training_args)
        self.engine_config = EngineConfig(**engine_args)
        self.model, self.tokenizer = self.load_model(model_name)
        self.tokenizer.chat_template = self.get_conversation_template()
        self.data_module = ChatDataModule(self.tokenizer, dataset_name, self.tokenizer.chat_template, self.engine_config.max_tokens)

    def load_model(self, model_name):
        bnb_config = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_compute_dtype=torch.float16)

        peft_config = LoraConfig(
            lora_alpha=32,
            lora_dropout=0.05,
            r=8,
            bias="none",
            task_type="CAUSAL_LM",
            target_modules=["q_proj", "v_proj", "o_proj", "k_proj"]
        )

        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True,
            use_auth_token=self.engine_config.hf_token
        )


        model = get_peft_model(model, peft_config)

        print("device map", model.hf_device_map)
        print("trainable", model.print_trainable_parameters())

        tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True, use_auth_token=self.engine_config.hf_token)
        tokenizer.pad_token = tokenizer.eos_token

        return model, tokenizer
    
    def get_conversation_template(self):
        print("chat template jajaaaa", self.tokenizer.chat_template)
        if self.tokenizer.chat_template is not None:
            if not "Only user and assistant roles are supported" in self.tokenizer.chat_template:
                return self.tokenizer.chat_template
        
        if self.tokenizer.default_chat_template is not None:
            if not "Only user and assistant roles are supported" in self.tokenizer.default_chat_template:
                return self.tokenizer.default_chat_template

        alt_tokenizer = AutoTokenizer.from_pretrained(self.engine_config.default_conversation_template_id, trust_remote_code=True, use_auth_token=self.engine_config.hf_token)
        return alt_tokenizer.chat_template
    

    def train(self):

        trainer = Trainer(
            model=self.model,
            train_dataset=self.data_module.dataset,
            tokenizer=self.tokenizer,
            args=self.training_args,
            data_collator=self.data_module.data_collator,
            callbacks=self.engine_config.callbacks
        )

        trainer.train()
        trainer.save_model()
