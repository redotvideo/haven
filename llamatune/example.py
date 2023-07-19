from llamatune import ChatTrainer, TrainingConfig
from transformers import HfArgumentParser, TrainingArguments
from dataclasses import dataclass, field

from dataclasses import dataclass, field
from transformers import TrainingArguments
import torch
from typing import Optional

@dataclass
class TrainingConfig(TrainingArguments):
    model_name: str = field(default="meta-llama/Llama-2-13b-hf", metadata={"help": 'Huggingface Name of the model you want to train'})
    data_path: str = field(default="data.json", metadata={"help": 'Path towards your training data'})
    output_dir: str = field(default='./trained_model', metadata={"help": 'The output dir for logs and checkpoints'})
    recipe: str = field(default="lora", metadata={"help": "Lora Training or Full Training"})
    optim: str = field(default='paged_adamw_8bit', metadata={"help": 'The optimizer to be used'})
    batch_size: int = field(default=1, metadata={"help": 'The training batch size per GPU. Increase for better speed.'})
    gradient_accumulation_steps: int = field(default=32, metadata={"help": 'How many gradients to accumulate before to perform an optimizer step'})
    n_epochs: int = field(default=3, metadata={"help": 'How many optimizer update steps to take'})
    weight_decay: float = field(default=0.0, metadata={"help": 'The L2 weight decay rate of AdamW'}) 
    learning_rate: float = field(default=2e-5, metadata={"help": 'The learning rate'})
    max_grad_norm: float = field(default=0.3, metadata={"help": 'Gradient clipping max norm. This is tuned and works well for all models tested.'})
    gradient_checkpointing: bool = field(default=True, metadata={"help": 'Use gradient checkpointing. You want to use this.'})
    do_train: bool = field(default=True, metadata={"help": 'To train or not to train, that is the question?'})
    lr_scheduler_type: str = field(default='cosine', metadata={"help": 'Learning rate schedule. Constant a bit better than cosine, and has advantage for analysis'})
    warmup_ratio: float = field(default=0.03, metadata={"help": 'Fraction of steps to do a warmup for'})
    logging_steps: int = field(default=1, metadata={"help": 'The frequency of update steps after which to log the loss'})
    group_by_length: bool = field(default=True, metadata={"help": 'Group sequences into batches with same length. Saves memory and speeds up training considerably.'})
    save_strategy: str = field(default='epoch', metadata={"help": 'When to save checkpoints'})
    save_total_limit: int = field(default=3, metadata={"help": 'How many checkpoints to save before the oldest is overwritten'})
    fp16: bool = field(default=True, metadata={"help": 'Whether to use fp16 mixed precision training'})
    tokenizer_type: str = field(default="llama", metadata={"help": "Tokenizer type. Should be \"llama\" for llama models to address tokenizer issue"})
    trust_remote_code: str = field(default=False, metadata={"help": "Whether to trust remote code."})
    compute_dtype: torch.dtype = field(default=torch.float16, metadata={"help":"Compute Datatype for models, either float16 or float32."})
    max_tokens: int = field(default=4096, metadata={"help":"Max tokens"})
    do_eval: bool = field(default=True, metadata={"help": "Whether to evaluate or not"})
    evaluation_strategy: str = field(default="epoch", metadata={"help": "When to evaluate, after certain number of steps or each epoch"})
    use_auth_token: str = field(default=None, metadata={"help": "auth token"})
    use_fast: bool = field(default=True, metadata={"help": "Whether to use fast tokenizer"})
    bits: Optional[int] = field(default=4, metadata={"help": "Number of bits to quantize the model to"})
    double_quant: bool = field(default=True, metadata={"help": "Compress the quantization statistics through double quantization."})
    quant_type: str = field(default="nf4", metadata={"help": "Quantization data type to use. Should be one of `fp4` or `nf4`."})
    lora_r: int = field(default=64, metadata={"help": "Lora R dimension."})
    lora_alpha: float = field(default=16, metadata={"help": " Lora alpha."})
    lora_dropout: float = field(default=0.0, metadata={"help":"Lora dropout."})


hfparser = HfArgumentParser((TrainingConfig))
args = hfparser.parse_args_into_dataclasses(return_remaining_strings=True)


print(args)
exit()

trainer = ChatTrainer(training_config=args)
trainer.train()