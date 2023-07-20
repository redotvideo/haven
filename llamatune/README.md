# LlamaTune 🦙

llamatune is an extremely simple tool that lets you fine-tune LLaMA V2 models on chat datasets without writing code. It supports QLora-Finetuning with 4-and 8-bit quantization, model parallelism across GPUs, and other features such as mixed precision training out of the box for all (7B, 13B and 70B) Llama sizes. 
<br>

## Getting Started

To get started, we need to install `llamatune` as well as the latest versions of `transformers`and `peft`:

```
pip install llamatune
pip install git+https://github.com/huggingface/peft
pip install git+https://github.com/huggingface/transformers
```

Now, we can finetune a 4-bit lora model on our dataset `chat.json`:

```
python -m llamatune.train
    --model_name meta-llama/Llama-2-13b
    --data_path chat.json
    --training_recipe lora
    --batch_size 8
    --gradient_accumulation_steps 4
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


## Testing a Trained Model
