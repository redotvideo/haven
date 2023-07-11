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

## Welcome 💜

Welcome to Haven's repository! Our goal is to make the deployment of LLMs in production as easy as possible. 

**Try the Haven API:** Check out our [demo on Google Colab](https://colab.research.google.com/drive/1eGGSisS9Du5-_KcaejY5y9vk9v7EIfba?usp=sharing) to chat with MPT-7B-Chat!

If you want to deploy LLMs yourself, this is what the API looks like:

```python
from havenpy import Haven

client = Haven("<ip-adress-of-your-vm>:50051", "<your-bearer-token>")

worker_id = client.create_inference_worker(
	model_name="@huggingface/mosaicml/mpt-7b-chat",
	quantization="float16", gpu_type="A100", gpu_count=1)

print(worker_id)
```

Now, the VM will be set up and the model will be downloaded. When this is done, you can query your LLM server as follows:

```python
stream = client.chat_completion(worker_id, messages=[{
	"content": "Write a newspaper article about how easy it is to set up Haven.",
	"role": "USER"
}], stream=True)

for s in stream:
	print(s.text)
```

<br>

## Getting Started 🔥

Spinning up your first LLM server with Haven requires just four steps:

1. Deploy Haven's manager container on Google Cloud
2. Create a Google Cloud service account
3. Upload your service account credentials to the manager
4. Spin up your first model

#### 1. Deploy Haven's manager on Google Cloud

You can deploy Haven's manager from its docker image using the gcloud CLI ([Installation instructions](https://cloud.google.com/sdk/docs/install?hl=en#deb)). You can optionally choose a `BEARER_TOKEN` to authenticate users sending requests to your LLM server.

```bash copy
gcloud compute instances create-with-container haven-manager \
  --container-image havenhq/haven \
  --machine-type e2-micro \
  --tags=https-server,http-server \
  --container-env BEARER_TOKEN=<some-bearer-token>
```

To communicate with Haven's manager, you need to expose port 50051 and 50052:

```bash copy
gcloud compute firewall-rules create allow-50051 --allow tcp:50051 --target-tags http-server
gcloud compute firewall-rules create allow-50052 --allow tcp:50052 --target-tags http-server
```


#### 2. Create a Google Cloud Service Account

To give Haven's manager the permission to spin up resources for you, you need to create a service account whose credentials can be passed to the manager. You also need to specify a project id for the service account (you can find all project ids using `gcloud projects list`).

```bash copy
gcloud iam service-accounts create haven-service-account --project=<your-project-id>
```

Now, assign the service account the role of an editor:

```bash copy
gcloud projects add-iam-policy-binding <your-project-id> \
  --role="roles/editor" \
  --member="serviceAccount:haven-service-account@<your-project-id>.iam.gserviceaccount.com"
```

Finally, download the service account key file:

```bash copy
gcloud iam service-accounts keys create ./key.json \
  --iam-account=haven-service-account@<your-project-id>.iam.gserviceaccount.com
```


#### 3. Upload your key file to the manager

Almost done! You now need to upload your service account key file to the manager. You can do so using Haven's sdk. First, install the sdk:

```bash copy
pip install havenpy
```

Now, connect to your manager and upload your key file:

```python copy
from havenpy import Haven
client = Haven("<ip-adress-of-your-vm>:50051", "<your-bearer-token>")

# Now you can add your google cloud service account file to the deployment
with open("key.json", "r") as f:
	client.setup(key_file=f.read())
```


#### 4. Spin up your first LLM server

Awesome, you're set up! Now, you can easily spin up your first LLM server with just a single line of code:

```python filename="python" copy
# Create a worker running the mpt-7b-chat model from Huggingface
worker_id = client.create_inference_worker(
	model_name="@huggingface/mosaicml/mpt-7b-chat",
	quantization="float16", gpu_type="T4", gpu_count=2)

print(worker_id)
```

When checking `gcloud compute instances list`, you'll now be able to see your VM instance starting. After starting, it will set up a docker container and download the model weights. This usually takes around 5-20 minutes, depending on the model size. To check whether your model is ready to be called, you can read the worker's status:

```python copy
print(client.list_workers())
```

If the server is still getting set up, it will show `STATUS: LOADING`. If it is running, the status will be `ONLINE` and you're ready to make your first call! Here is how you can do it:


```python copy
res = client.chat_completion(worker_id, messages=[{
	"content": "Write a newspaper article about Marc Zuckerberg.",
	"role": "USER"
}], stream=True)

for r in res:
	print(r.text, flush=True, end="")
```

Congrats! You are now using open-source LLMs in your own cloud.

<br>

## Roadmap 🚀

We're constantly building new features and would love your feedback! Here's what we are currently looking to integrate into our platform:

- [x] Inference
- [x] Google Cloud Support
- [ ] Fine-Tuning
- [ ] AWS Support

<br>

## Learn More 🔍

To learn more about our platform, you should refer to our [documentation](https://docs.haven.run/).
