<p align="center">
  <a href="https://havenllm.com"><img src="https://github.com/havenhq/haven/assets/122226645/3ce54c45-668d-42c9-84fb-c62d8d38b643" width="300"/></a>
</p>

<p align="center">
    <b>Train and Deploy LLMs On Your Own Infrastructure</b>
</p>

<div align="center">

[💻 Quickstart]()
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
[🏠 Website]()
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
[📄 Docs]()
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
[💬 Slack]()
<br>
<p align="center">
    Haven lets you build LLM-powered applications <b>hosted entirely on your own infrastructure</b>.<br>
    Just select a model to run - Haven will set up a production-ready 
  API server hosted in your GCP environment.
</p>


</div>


<br>
<br>



## Getting Started 🔥

Setting up an LLM server requires just three steps:

1. Get an API key for a Google Cloud service account
2. Deploy Haven's manager container on a Google Cloud instance
3. Spin up a model worker using the Python SDK

To follow these steps, you can either check out our three-minute [video tutorial]() or take a look at the documentation below. 


<br>

### Getting a Google Cloud API Key 🔑
A Google Cloud API key is required to let Haven spin up VM instances for you. In the following, we assume that you have a project on your Google Cloud Account and have downloaded the gcloud cli ([instructions](https://cloud.google.com/sdk/docs/install?hl=de#deb):

First, create a new service account:
```
gcloud iam service-accounts create <haven-service-account-name> --project=<your-project-id>
```

Now, assign the service account the role of an editor:
```
gcloud projects add-iam-policy-binding <your-project-id> --member="serviceAccount:<haven-service-account-name>@<your-project-id>.iam.gserviceaccount.com" --role="roles/editor"
```

Finally, download the service account key file
```
gcloud iam service-accounts keys create path/to/haven-key.json --iam-account=<haven-service-account-name>@<your-project-id>.iam.gserviceaccount.com
```


<br>

### Deploy Haven's Manager Container 🐳

The manager is responsible for setting up model servers and handling the communication between them and the client sdk. A small VM is sufficient to run the manager.

To deploy the manager container on a 

<br>

### Features

- One click install. Haven is a single docker image.
- Deploy models fully automatically. Add your Google Cloud API key and Haven will automatically provision a VM, deploy your model, and give you a public endpoint.
- SDKs in Python and Typescript

Coming soon:

- Fine-tune models
- Horizontal scaling of model instances

### Installation

Pull the latest image from Docker Hub at `havenllm/haven:latest`. You can also build the image yourself by cloning this repo and running `docker build -t haven .`. Alternatively you can use the image from the Google Cloud App Store.

Navigate to the url of your deployment and upload your google cloud api key. That's it! You're ready to deploy models.

### Usage

You can install the python sdk with `pip install havenllm` or the typescript sdk with `npm install havenllm`.
