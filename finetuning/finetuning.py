import time
import torch
from datasets import load_dataset
from transformers import AutoModelForCausalLM, BitsAndBytesConfig, AutoTokenizer, TrainingArguments, TrainerCallback
from peft import LoraConfig
from trl import SFTTrainer, DataCollatorForCompletionOnlyLM
from huggingface_hub import HfApi, create_repo
import wandb
import os
from training_engine.engine import ModelEngine
import random
import string
import argparse
import modal
from typing import Dict
from training_engine.utils import send_update

from fastapi import HTTPException
from modal import gpu, Mount, Stub, Image, Volume, Secret, web_endpoint
from modal.cli.volume import put


image = (
    Image.debian_slim(python_version="3.10").apt_install("git")
    # Pinned to 10/16/23
    .pip_install("torch==2.0.1", "transformers==4.35.0", "peft==0.6.0", "accelerate==0.24.1", "bitsandbytes==0.41.1", "einops==0.7.0", "evaluate==0.4.1", "scikit-learn==1.2.2", "sentencepiece==0.1.99", "wandb==0.15.3", "trl==0.7.2", "huggingface-hub"
    ).pip_install("hf-transfer").pip_install("requests").pip_install("modal-client")
    .env(dict(HUGGINGFACE_HUB_CACHE="/pretrained_models", HF_HUB_ENABLE_HF_TRANSFER="0", MODAL_CONFIG_PATH="/utils/modal.toml"))
)

stub = Stub("llama-finetuning", image=image)
stub.model_volume = modal.NetworkFileSystem.persisted("adapters")


@stub.function(
    volumes={
        "/datasets": modal.Volume.from_name("datasets"),
        "/pretrained_models": modal.Volume.from_name("pretrained_models"),
        "/utils": modal.Volume.from_name("utils"),
    },
    network_file_systems={
        "/trained_adapters": stub.model_volume
    },
    mounts=[modal.Mount.from_local_dir("./other", remote_path="/other")],
    gpu=gpu.A100(count=1, memory=80),
    timeout=3600 * 12,
    allow_cross_region_volumes=True,
    secret=Secret.from_name("finetuning-auth-token")
)
@web_endpoint(method="POST", wait_for_response=False)
def train(inputs: Dict):

    if inputs["auth_token"] != os.environ["AUTH_TOKEN"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect auth token",
        )


    if torch.cuda.is_available():
    # Get the current GPU device
        device = torch.cuda.current_device()
        
        # Get the available GPU memory
        gpu_memory = torch.cuda.get_device_properties(device).total_memory / (1024 ** 2)  # in megabytes

        print("GPU memory", gpu_memory)
    
    model_folder_name = f"/trained_adapters/{inputs['model_id']}"
    os.environ["WANDB_PROJECT"]="haven"

    try:
        wandb.login(anonymous="must", key=inputs["wandb_token"])
        log_wandb = True
    except Exception as e:
        print("exception: not logged in to wandb")
        print(e)
        log_wandb = False

    try:
        model_engine = ModelEngine(model_name=inputs["model_name"], 
                                dataset_name=inputs["dataset_name"], 
                                training_args=get_training_args(inputs, output_dir=model_folder_name, log_wandb=log_wandb),
                                engine_args=get_engine_args(inputs)
        )

        model_engine.train()
        if log_wandb:
            wandb.finish()

        model_engine.tokenizer.save_pretrained(model_folder_name)
        save_readme_file(hf_repo_name=inputs["hf_repo"], base_model_name=inputs["model_name"], model_directory=model_folder_name)

        upload_model(repo=inputs["hf_repo"], folder_path=model_folder_name, hf_token=inputs["hf_token"])
        send_update(model_id=inputs["model_id"], key="status", value="finished")

    except Exception as e:
        print("exception:", e)
        send_update(model_id=inputs["model_id"], key="status", value="error")



def get_training_args(inputs, output_dir, log_wandb):
    learning_rate_map = dict(Low=5e-5, Medium=1e-4, High=3e-4)
    if log_wandb:
        report_to = "wandb"
    else:
        report_to = "none"

    return dict(
        learning_rate=learning_rate_map[inputs["learning_rate"]],
        num_train_epochs=inputs["num_epochs"],
        output_dir=output_dir,
        gradient_accumulation_steps=inputs["gradient_accumulation_steps"],
        per_device_train_batch_size=inputs["per_device_train_batch_size"],
        report_to=report_to
    )

def get_engine_args(inputs):

    class TrainingStartedCallback(TrainerCallback):
        def on_train_begin(self, args, state, control, **kwargs):
            try:
                print("sending url", wandb.run.url)
            except Exception as e:
                print("wandb url not found exception", e)
                return
            
            send_update(model_id=inputs["model_id"], key="wandb", value=wandb.run.url)


    return dict(
        wandb_token=inputs["wandb_token"],
        hf_token="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",
        max_tokens=inputs["max_tokens"],
        callbacks=[TrainingStartedCallback]
    )

def generate_random_string():
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(8))


def upload_model(repo, folder_path, hf_token):
    api = HfApi()

    create_repo(repo, use_auth_token=hf_token, private=True)
    api.upload_folder(
        folder_path=folder_path,
        repo_id=repo,
        repo_type="model",
        use_auth_token=hf_token,
    )


def save_readme_file(hf_repo_name: str, base_model_name: str, model_directory: str):
    with open("/other/hf_readme_template.md", "r") as f:
        data = f.read()

    full_readme = data.replace("{{base_model_name}}", base_model_name).replace("{{model_name}}", hf_repo_name)

    with open(f"{model_directory}/README.md", "w") as f:
        f.write(full_readme)


if __name__=="__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--learning_rate", type=str, choices=["Low", "Medium", "High"], default="Medium")
    parser.add_argument("--num_epochs", type=int, default=3)
    parser.add_argument("--model_name", default="meta-llama/Llama-2-7b-chat-hf")
    parser.add_argument("--max-tokens", type=int, default=2600)
    parser.add_argument("--gradient_accumulation_steps", type=int, default=16)
    parser.add_argument("--per_device_train_batch_size", type=int, default=1)
    parser.add_argument("--dataset_name", type=str)
    parser.add_argument("--hf_repo", type=str)
    args = parser.parse_args()

        
    
    train.local((dict(
            wandb_token="d519a364bc5fcc5970e3eb1e9cc54225c444e511",
            hf_token="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",
            learning_rate=args.learning_rate,
            num_epochs=args.num_epochs,
            model_name=args.model_name,
            dataset_name=args.dataset_name,
            hf_repo=args.hf_repo,
            max_tokens=args.max_tokens,
            gradient_accumulation_steps=args.gradient_accumulation_steps,
            per_device_train_batch_size=args.per_device_train_batch_size,
            auth_token="",
            model_id=generate_random_string()
            )
        ))

