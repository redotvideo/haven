from modal import Image, Mount, Secret, Stub, asgi_app, gpu, method, Volume, NetworkFileSystem
import lorax
from typing import List, Dict
from transformers import AutoTokenizer
import requests
import json

from fastapi import BackgroundTasks, FastAPI, Request
from fastapi.responses import Response, StreamingResponse, JSONResponse


GPU_CONFIG = gpu.A10G(count=1)
MODEL_ID = "meta-llama/Llama-2-7b-chat-hf"

LAUNCH_FLAGS = [
    "--model-id",
    MODEL_ID,
    "--port",
    "8000",
    "--cuda-memory-fraction",
    "0.95",
    "--max-input-length",
    "2048",
    "--max-total-tokens",
    "4096"
]


image = (
    Image.from_registry("ghcr.io/predibase/lorax:latest")
    .dockerfile_commands("ENTRYPOINT []")
    .pip_install("lorax-client").pip_install("transformers==4.35.0").env(dict(HUGGINGFACE_HUB_CACHE="/pretrained_models"))
)

stub = Stub("multi-lora-server-" + MODEL_ID.split("/")[0]+"-"+MODEL_ID.split("/")[1], image=image)


@stub.cls(
    secret=Secret.from_name("huggingface-token"),
    gpu=GPU_CONFIG,
    allow_concurrent_inputs=100,
    container_idle_timeout=60 * 10,
    timeout=60 * 60,
    keep_warm=1,
    allow_cross_region_volumes=True,
    volumes={
        "/pretrained_models": Volume.from_name("pretrained_models")
    },
    network_file_systems={
        "/trained_adapters": NetworkFileSystem.persisted("adapters")
    }  
)
class Model:
    def __enter__(self):
        import socket
        import subprocess
        import time

        from lorax import AsyncClient

        self.launcher = subprocess.Popen(
            ["lorax-launcher"] + LAUNCH_FLAGS
        )
        self.client = AsyncClient("http://127.0.0.1:8000", timeout=60)
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)


        def webserver_ready():
            try:
                socket.create_connection(("127.0.0.1", 8000), timeout=1).close()
                return True
            except (socket.timeout, ConnectionRefusedError):

                retcode = self.launcher.poll()
                if retcode is not None:
                    raise RuntimeError(
                        f"launcher exited unexpectedly with code {retcode}"
                    )
                return False

        while not webserver_ready():
            time.sleep(1.0)

        print("Webserver ready!")

    def __exit__(self, _exc_type, _exc_value, _traceback):
        self.launcher.terminate()

    
    @asgi_app()
    def fastapi_app(self):
        app = FastAPI()


        @app.post("/generate")
        async def generate(request: Request):
            request = await request.json()
            chat = request["chat"]
            parameters = request["parameters"]

            prompt = self.tokenizer.apply_chat_template(chat, tokenize=False, add_generation_prompt=True)

            payload = {
                "inputs": prompt,
                "parameters": parameters
            }
            url = "http://127.0.0.1:8000/generate"
            headers = {"Content-Type": "application/json"}
            response = requests.post(url, headers=headers, json=payload)

            return Response(content=json.dumps(response.json(), ensure_ascii=False).encode("utf-8"))

        @app.post("/generate_stream")
        async def generate_stream(request: Request):
            request = await request.json()
            chat = request["chat"]
            parameters = request["parameters"]

            prompt = self.tokenizer.apply_chat_template(chat, tokenize=False, add_generation_prompt=True)

            print("prompt", prompt)
            
            payload = {
                "inputs": prompt,
                "parameters": parameters
            }
            url = "http://127.0.0.1:8000/generate_stream"
            headers = {"Content-Type": "application/json"}
            response = requests.post(url, headers=headers, json=payload, stream=True)

            print("res", response)

            def stream():
                for line in response:
                    print(line)
                    yield line


            return StreamingResponse(stream(), media_type="text/event-stream")

        return app

