# LoraX API Server

To deploy a multi lora server for a certain model, you need to first specify the 'MODEL_ID' in 'lorax_api_server.py' (the model id should be the huggingface name of the desired base model). Afterwards, just run:

```
modal deploy lorax_api_server.py
```