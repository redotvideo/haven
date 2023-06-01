from transformers import AutoTokenizer, AutoModelForCausalLM
import transformers
from peft import PeftConfig, PeftModel
import accelerate
import bitsandbytes
import torch

DEFAULT_PAD_TOKEN = "[PAD]"


def smart_tokenizer_and_embedding_resize(tokenizer: transformers.PreTrainedTokenizer, model: transformers.PreTrainedModel):
    """
    Resize tokenizer and embedding.

    Note: This is the unoptimized version that may make your embedding size not be divisible by 64.
    """

    special_tokens_dict = dict(pad_token=DEFAULT_PAD_TOKEN)
    num_new_tokens = tokenizer.add_special_tokens(special_tokens_dict)
    model.resize_token_embeddings(len(tokenizer))

    if num_new_tokens > 0:
        input_embeddings = model.get_input_embeddings().weight.data
        output_embeddings = model.get_output_embeddings().weight.data

        input_embeddings_avg = input_embeddings[:-num_new_tokens].mean(dim=0, keepdim=True)
        output_embeddings_avg = output_embeddings[:-num_new_tokens].mean(dim=0, keepdim=True)

        input_embeddings[-num_new_tokens:] = input_embeddings_avg
        output_embeddings[-num_new_tokens:] = output_embeddings_avg


#model = transformers.AutoModelForCausalLM.from_pretrained("EleutherAI/pythia-1.4b-deduped", device_map='auto')

#model.save_pretrained("./model")

model = transformers.AutoModelForCausalLM.from_pretrained("./model", device_map='auto')


tokenizer = transformers.GPTNeoXTokenizerFast.from_pretrained(
    "EleutherAI/pythia-1.4b-deduped",
    model_max_length=512,
    padding_side="right",
    use_fast=False,
)

if tokenizer.pad_token is None:
    smart_tokenizer_and_embedding_resize(
        tokenizer=tokenizer,
        model=model,
    )


prompt = "Large Language Models are"

inputs = tokenizer(prompt, return_tensors='pt').input_ids.to('cuda')
outputs = model.generate(input_ids=inputs, max_new_tokens=300, do_sample=True, top_p=0.9, top_k=400, temperature=0.8)
completion = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]

print(completion)