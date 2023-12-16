---
library_name: peft
base_model: meta-llama/Llama-2-7b-chat-hf
---

# Model Card for {{model_name}}

This is a lora adapter for {{base_model_name}} that was trained and automatically uploaded with [Haven](https://haven.run/).


## Testing the Model

To quickly test the model, you can run it on a GPU with the transformers / peft library:

```python
from peft import AutoPeftModelForCausalLM
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("{{model_name}}")
model = AutoPeftModelForCausalLM.from_pretrained("{{model_name}}").to("cuda") # if you get a CUDA out of memory error, try load_in_8bit=True

messages = [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hi, can you please explain machine learning to me?"}
]

encodeds = tokenizer.apply_chat_template(messages, return_tensors="pt").to("cuda")
generated_ids = model.generate(input_ids=model_inputs, min_new_tokens=10, max_new_tokens=300, do_sample=True, temperature=0.9, top_p=0.8)
decoded = tokenizer.batch_decode(generated_ids)

print(decoded[0])
```