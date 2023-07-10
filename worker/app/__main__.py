import os
import json

import asyncio
import grpc

from transformers import TextIteratorStreamer
from app.pb import worker_pb2, worker_pb2_grpc
from app.worker.inference_worker import InferenceClient
from app.worker.models.inference_utils.parameter_passing import get_inference_parameter_dict

ABSOLUTE_PATH = os.path.dirname(__file__)
path_to_config =os.path.join(ABSOLUTE_PATH, "../config.json")
config = json.load(open(path_to_config, "r"))

inference_client = InferenceClient(config=config)
running = True

class WorkerService(worker_pb2_grpc.WorkerServiceServicer):

    def Health(self, request, context):
        global running
        status = worker_pb2.WorkerStatus.OK if running else worker_pb2.WorkerStatus.STOPPING
        return worker_pb2.HealthResponse(status=status)

    def Shutdown(self, request, context):
        global running
        running = False
        return worker_pb2.ShutdownResponse()

    async def ChatCompletion(self, request: worker_pb2.ChatCompletionRequest, context):
        """
            Haven supports chat-models and non-chat models. We can distinguish between the two 
            by checking if the instructionPrefix is part of the config that is passed to the worker.
        """
        if config["instructionPrefix"] not in request.messages:
            context.abort(grpc.StatusCode.FAILED_PRECONDITION, "This worker only supports non-chat completion requests. Refer to the documentation if you are unsure what this means.")

        # Now we can handle the request
        messages = list(request.messages)

        inference_params = get_inference_parameter_dict(dict(max_tokens=request.max_tokens, top_p=request.top_p, top_k=request.top_k, temperature=request.temperature))
        streamer = inference_client.complete_chat(messages=messages, inference_params=inference_params)

        if isinstance(streamer, TextIteratorStreamer):
            for text in streamer:
                if inference_client.model_engine.model_config["instructionPrefix"] in text:
                    break

                yield worker_pb2.ChatCompletionResponse(text=text)
        else:
            potential_stop_string = ""
            async for text in streamer:
                if potential_stop_string+text in inference_client.model_engine.model_config["instructionPrefix"]:
                            potential_stop_string += text
                            continue
                
                yield worker_pb2.CompletionResponse(text=potential_stop_string+text)
                potential_stop_string = ""

    async def Completion(self, request: worker_pb2.CompletionRequest, context):
        prompt = list(request.prompt)
        stop_tokens = list(request.stop_tokens)
        
        inference_params = get_inference_parameter_dict(dict(max_tokens=request.max_tokens, top_p=request.top_p, top_k=request.top_k, temperature=request.temperature))
        streamer = inference_client.complete(prompt=prompt, stop_tokens=stop_tokens, inference_params=inference_params)

        if isinstance(streamer, TextIteratorStreamer):
            for text in streamer:
                yield worker_pb2.CompletionResponse(text=text)

        else:
            async for text in streamer:                
                yield worker_pb2.CompletionResponse(text=text)

async def serve():
    server = grpc.aio.server()
    worker_pb2_grpc.add_WorkerServiceServicer_to_server(
        WorkerService(), server)
    listen_address = '[::]:50051'  # Set your desired listening address
    server.add_insecure_port(listen_address)
    await server.start()
    await server.wait_for_termination()

if __name__ == '__main__':
    print("starting server...")
    asyncio.run(serve())