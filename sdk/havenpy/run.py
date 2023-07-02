import grpc

from .interceptor import add_header
from .pb import manager_pb2_grpc, manager_pb2

from typing import List

class Haven:
	client: manager_pb2_grpc.HavenStub

	def __init__(self, url: str, token: str):
		channel = grpc.insecure_channel(url)
		interceptor = add_header('authorization', f'Bearer {token}')
		channel = grpc.intercept_channel(channel, interceptor)
		self.client = manager_pb2_grpc.HavenStub(channel)

	def setup(self, key_file: str) -> manager_pb2.Empty:
		request = manager_pb2.SetupRequest(key_file=key_file)
		return self.client.Setup(request)

	def chat_completion(self, worker_name: str, messages: List[manager_pb2.Message], stream: bool = False, max_tokens: int = None, top_p: float = None, top_k: int = None, temperature: float = None) -> manager_pb2.ChatCompletionResponse or str:
		request = manager_pb2.ChatCompletionRequest(worker_name=worker_name, messages=messages, max_tokens=max_tokens, top_p=top_p, top_k=top_k, temperature=temperature)
		responseStream: manager_pb2.ChatCompletionResponse = self.client.ChatCompletion(request)

		if stream:
			return responseStream
		
		res: str = ""
		for response in responseStream:
			res += response.text

		return res
	
	def list_models(self) -> manager_pb2.ListModelsResponse:
		request = manager_pb2.Empty()
		return self.client.ListModels(request)
	
	def list_workers(self) -> manager_pb2.ListWorkersResponse:
		request = manager_pb2.Empty()
		return self.client.ListWorkers(request)
	
	def create_inference_worker(self, model_name: str, quantization: str, worker_name:str=None, gpu_type: manager_pb2.GpuType=None, gpu_count: int=None) -> manager_pb2.InferenceWorker:
		request = manager_pb2.CreateInferenceWorkerRequest(model_name=model_name, quantization=quantization, worker_name=worker_name, gpu_type=gpu_type, gpu_count=gpu_count)
		return self.client.CreateInferenceWorker(request)
	
	def pause_inference_worker(self, worker_name: str) -> manager_pb2.InferenceWorker:
		request = manager_pb2.InferenceWorker(worker_name=worker_name)
		return self.client.PauseInferenceWorker(request)
	
	def resume_inference_worker(self, worker_name: str) -> manager_pb2.InferenceWorker:
		request = manager_pb2.InferenceWorker(worker_name=worker_name)
		return self.client.ResumeInferenceWorker(request)
	
	def delete_inference_worker(self, worker_name: str) -> manager_pb2.InferenceWorker:
		request = manager_pb2.InferenceWorker(worker_name=worker_name)
		return self.client.DeleteInferenceWorker(request)