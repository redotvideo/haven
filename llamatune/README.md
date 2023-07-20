# LlamaTune 🦙

llamatune is an extremely simple tool that lets you fine-tune LLaMA V2 models on chat datasets without writing code. It supports QLora-Finetuning with 4-and 8-bit quantization, model parallelism across GPUs, and other features such as mixed precision training out of the box for all (7B, 13B and 70B) Llama sizes. 


This is how you can fine-tune Llama 13B on the OpenAssistant chat dataset:
```
python -m llamatune.train --model_name meta-llama/Llama-2-13b --data_path chat.json --batch_size 8 --gradient_accumulation_steps 4
```



<br>

The file `chat.json` has to be of the following format (note that the system prompt is optional):

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
