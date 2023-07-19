import os
import torch
import transformers
import bitsandbytes as bnb

from dataclasses import dataclass, field
from typing import Optional, Dict
from transformers import BitsAndBytesConfig
from peft import prepare_model_for_kbit_training, LoraConfig, get_peft_model
from transformers import Trainer

from llamatune.model_engines.engine_registry import RegisteredEngine
from llamatune.utils import _get_compute_dtype, print_trainable_parameters



class LlamaEngine:

    def __init__(self, model_name, training_recipe, training_config):
        if not training_recipe in ["lora", "full_training"]:
            raise Exception(f"{training_recipe} is not a valid training recipe. Please choose either \"lora\" or \"full_training\"")
        
        self.config = training_config
        self.training_recipe = training_recipe
        self.model_name = model_name

    
    def train(self, data_module):
        print("config", self.config)

        training_args = self.construct_training_arguments()

        trainer = Trainer(
            model=self.model,
            tokenizer=self.tokenizer,
            train_dataset=data_module.train_dataset,
            data_collator=data_module.data_collator,
            args=training_args
        )

        trainer.train()


    def prepare_model_for_training(self):
        if self.config.training_recipe == "lora":
            self.model = transformers.AutoModelForCausalLM.from_pretrained(
                self.model_name,
                load_in_4bit=self.config.bits == 4,
                load_in_8bit=self.config.bits == 8,
                device_map=self._get_device_map(),
                torch_dtype=self.config.compute_dtype,
                trust_remote_code=self.config.trust_remote_code,
                use_auth_token=self.config.use_auth_token,
                quantization_config=BitsAndBytesConfig(
                    load_in_4bit=self.config.bits == 4,
                    load_in_8bit=self.config.bits == 8,
                    llm_int8_threshold=6.0,
                    llm_int8_has_fp16_weight=False,
                    bnb_4bit_compute_dtype=self.config.compute_dtype,
                    bnb_4bit_use_double_quant=self.config.double_quant,
                    bnb_4bit_quant_type=self.config.quant_type,
                    trust_remote_code=self.config.trust_remote_code
                )
            )

        elif self.config.training_recipe == "full_training":
            self.model = transformers.AutoModelForCausalLM.from_pretrained(
                self.model_name,
                device_map=self._get_device_map(),
                torch_dtype=self.config.compute_dtype,
                trust_remote_code=self.config.trust_remote_code,
                use_auth_token=self.config.use_auth_token
            )


        self.tokenizer = transformers.AutoTokenizer.from_pretrained(self.model_name, padding_side="right", use_fast=self.config.use_fast, tokenizer_type=self.config.tokenizer_type, trust_remote_code=self.config.trust_remote_code, use_auth_token=self.config.use_auth_token)

        self._smart_tokenizer_and_embedding_resize()

        if self.training_recipe == "lora":
            self.model = prepare_model_for_kbit_training(self.model, use_gradient_checkpointing=self.config.gradient_checkpointing)

        if self.config.gradient_checkpointing:
            self.model.gradient_checkpointing_enable()


        if self.training_recipe == "lora":
            modules = self._find_all_linear_names()

            lora_config = LoraConfig(
                r=self.config.lora_r,
                lora_alpha=self.config.lora_alpha,
                target_modules=modules,
                lora_dropout=self.config.lora_dropout,
                bias="none",
                task_type="CAUSAL_LM",
            )
            
            self.model = get_peft_model(self.model, lora_config)

        print("Model ready for training!")
        print_trainable_parameters(self.model)


    def _get_device_map(self):
        device_map = "auto"

        if os.environ.get("LOCAL_RANK") is not None:
            device_map = {'': int(os.environ.get('LOCAL_RANK', '0'))}
        
        return device_map
    
    def construct_training_arguments(self):

        args=transformers.TrainingArguments(
                output_dir = self.config.output_dir,
                optim = self.config.optim,
                per_device_train_batch_size = self.config.per_device_train_batch_size,
                gradient_accumulation_steps = self.config.gradient_accumulation_steps,
                num_train_epochs = self.config.num_epochs,
                weight_decay = self.config.weight_decay,
                learning_rate = self.config.learning_rate,
                max_grad_norm = self.config.max_grad_norm,
                gradient_checkpointing = self.config.gradient_checkpointing,
                do_train = self.config.do_train,
                lr_scheduler_type = self.config.lr_scheduler_type,
                warmup_ratio = self.config.warmup_ratio,
                logging_steps = self.config.logging_steps,
                group_by_length = self.config.group_by_length,
                save_strategy = self.config.save_strategy,
                save_steps = self.config.save_steps,
                save_total_limit = self.config.save_total_limit
            )

        return args


    def _find_all_linear_names(self):
        cls = bnb.nn.Linear4bit if self.config.bits == 4 else (bnb.nn.Linear8bitLt if self.config.bits == 8 else torch.nn.Linear)
        lora_module_names = set()
        for name, module in self.model.named_modules():
            if isinstance(module, cls):
                names = name.split('.')
                lora_module_names.add(names[0] if len(names) == 1 else names[-1])

        if self.config.lm_head_name in lora_module_names: # needed for 16-bit
            lora_module_names.remove(self.config.lm_head_name)

        return list(lora_module_names)
    

    def _smart_tokenizer_and_embedding_resize(self):
        if self.tokenizer.pad_token is None:
            num_new_tokens = self.tokenizer.add_special_tokens(dict(pad_token="[PAD]"))
            self.model.resize_token_embeddings(len(self.tokenizer))

            if num_new_tokens > 0:
                input_embeddings = self.model.get_input_embeddings().weight.data
                output_embeddings = self.model.get_output_embeddings().weight.data

                input_embeddings_avg = input_embeddings[:-num_new_tokens].mean(dim=0, keepdim=True)
                output_embeddings_avg = output_embeddings[:-num_new_tokens].mean(dim=0, keepdim=True)

                input_embeddings[-num_new_tokens:] = input_embeddings_avg
                output_embeddings[-num_new_tokens:] = output_embeddings_avg
        
