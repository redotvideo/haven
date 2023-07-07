<br>

<p align="center">
  <a href="https://haven.run"><img src="https://raw.githubusercontent.com/havenhq/haven/dev/logo.png" width="300"/></a>
</p>

<p align="center">
    <b>Fine-Tune and Deploy LLMs On Your Own Infrastructure</b>
</p>

<div align="center">

[💻 Quickstart](https://docs.haven.run/)
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
[📄 Docs](https://docs.haven.run/)
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
[💬 Discord](https://discord.gg/JDjbfp6q2G)
<br>

<p align="center">
    Haven lets you build LLM-powered applications <b>hosted entirely on your own infrastructure</b>.<br>
    Just select a model to run - Haven will set up a production-ready 
  API server in your private cloud.
</p>

</div>

<br>

<p align="center">
  <img src="https://raw.githubusercontent.com/havenhq/haven/dev/diagram.svg">
</p>

## Getting Started 🔥

Setting up an LLM server requires just three steps. We documented them in detail [here (https://docs.haven.run)](https://docs.haven.run/), but here's a quick overview:

1. Deploy Haven's manager container [docker.io/havenhq/haven](https://hub.docker.com/r/havenhq/haven) anywhere you like (could be your own machine), expose ports 50051 and 50052
2. Download a Google Cloud service account file that can create VMs in your project. You can do this via the Google Cloud website or through the CLI. Commands you can just copy and paste for this.
3. `pip install havenpy`. Spin up a model worker using the Python SDK. Examples below:

### Example code

```python
from havenpy import Haven

# Default bearer token is the string "insecure"
client = Haven("<ip-adress-of-your-vm>:50051", "<your-bearer-token>")

# Now you can add your google cloud service account file to the deployment
with open("key.json", "r") as f:
	client.setup(key_file=f.read())

worker_id = client.create_inference_worker(
	model_name="@huggingface/mosaicml/mpt-7b-chat",
	quantization="float16", gpu_type="A100", gpu_count=1)

print(worker_id)
```

Congrats! A worker is now starting on your Google Cloud. You can check the status like this:

```python
print(client.list_workers())
```

Once the worker is running, you can send it requests like this:

```python
streaming = client.chat_completion(worker_id, messages=[{
	"content": "Write a newspaper article about how easy it is to set up Haven.",
	"role": "USER"
}], stream=True)

for r in streaming:
	print(r.text)

# Or without streaming:
print(client.chat_completion(worker_id, messages=[{
  "content": "Are you sentient?",
  "role": "USER"
}], stream=False))
```

<br>

## Roadmap 🚀

We're constantly building new features and would love your feedback! Here's what we are currently looking to integrate into our platform:

- [x] Inference Workers
- [x] Google Cloud Support
- [ ] Fine-Tuning Workers
- [ ] AWS Support

<br>

## Learn More 🔍

To learn more about our platform, you should refer to our [documentation](https://docs.haven.run/).
