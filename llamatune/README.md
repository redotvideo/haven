# LlamaTune 🦙

llamatune is a simple tool that lets you fine-tune LLaMA V2 models on chat datasets without writing code. It supports QLora-Finetuning with 4-and 8-bit quantization, model parallelism across GPUs, and other features such as mixed precision training out of the box for all (7B, 13B and 70B) Llama sizes. 
<br>

## Getting Started

To get started, we need to install `llamatune` as well as the latest versions of `transformers`and `peft`:

```
pip install llamatune==0.4.0
pip install git+https://github.com/huggingface/peft
pip install git+https://github.com/huggingface/transformers
```

Now, we can finetune a 4-bit lora model on our dataset `chat.json`. Running this script will start training and provide you the option to track metrics using weights & biases:

```
python -m llamatune.train \
    --model_name meta-llama/Llama-2-13b-chat-hf \
    --data_path chat.json \
    --training_recipe lora \
    --batch_size 8 \
    --gradient_accumulation_steps 4 \
    --learning_rate 1e-4 \
    --output_dir chat_llama2_13b \
    --use_auth_token <YOUR-HUGGINGFACE-AUTH-TOKEN>
```



<br>

The file `chat.json` has to be of the following format (the system prompt is optional). There is no need to add any prompt templates (instruction tokens etc.), as Llama's default conversation template is automatically applied by `llamatune`.

```
[
    [
        {
            "role": "SYSTEM",
            "content": "You are a helpful and friendly assistant."
        },
        {
            "role": "USER",
            "content": "Hi, how are you?."
        },
        {
            "role": "ASSISTANT",
            "content": "Hey, I am good! How can I help you today?"
        },
        {
            "role": "USER",
            "content": "Can you please provide a few ideas for meals that I could cook today?"
        },
        {
            "role": "ASSISTANT",
            "content": "Sure! How about..."
        }
    ],
    [
        {
            "role": "SYSTEM",
            "content": "You are a an arrogant AI assistant."
        },
        {
            "role": "USER",
            "content": "Hi, can you please explain to me how bubblesort works?"
        },
        {
            "role": "ASSISTANT",
            "content": "Ha! How pathetic that you need an explanation for the easiest sorting algorithm! But if you insist, here is how it works: ..."
        }
    ],
...
```


## Hyperparameters

We use good default hyperparameters for most fine-tuning tasks. If you want to, you can however configure parameters by using the `--parameter` flag as shown above. Here are all hyperparameters that are configurable:

```python
model_name: str = field(default="meta-llama/Llama-2-7b-hf", metadata={"help": 'Huggingface Name of the model you want to train'})

data_path: str = field(default="data.json", metadata={"help": 'Path towards your training data'})

output_dir: str = field(default='./trained_model', metadata={"help": 'The output dir for logs and checkpoints'})

training_recipe: str = field(default="lora", metadata={"help": "Lora Training or Full Training"})

optim: str = field(default='paged_adamw_8bit', metadata={"help": 'The optimizer to be used'})

batch_size: int = field(default=1, metadata={"help": 'The training batch size per GPU. Increase for better speed.'})

gradient_accumulation_steps: int = field(default=16, metadata={"help": 'How many gradients to accumulate before to perform an optimizer step'})

n_epochs: int = field(default=3, metadata={"help": 'How many optimizer update steps to take'})

weight_decay: float = field(default=0.0, metadata={"help": 'The L2 weight decay rate of AdamW'}) 

learning_rate: float = field(default=1e-4, metadata={"help": 'The learning rate'})

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

use_fast: bool = field(default=False, metadata={"help": "Whether to use fast tokenizer"})

bits: Optional[int] = field(default=4, metadata={"help": "Number of bits to quantize the model to"})

double_quant: bool = field(default=True, metadata={"help": "Compress the quantization statistics through double quantization."})

quant_type: str = field(default="nf4", metadata={"help": "Quantization data type to use. Should be one of `fp4` or `nf4`."})

lora_r: int = field(default=64, metadata={"help": "Lora R dimension."})

lora_alpha: float = field(default=16, metadata={"help": " Lora alpha."})

lora_dropout: float = field(default=0.0, metadata={"help":"Lora dropout."})
```
