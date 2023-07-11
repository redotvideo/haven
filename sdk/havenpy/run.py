import grpc

from .interceptor import add_header
from .pb import manager_pb2_grpc, manager_pb2

from typing import List

def stream_to_string(stream: manager_pb2.CompletionResponse) -> str:
	res: str = ""
	for response in stream:
		res += response.text

	return res

class Haven:
	client: manager_pb2_grpc.HavenStub

	def __init__(self, url: str, token: str):
		channel = grpc.insecure_channel(url)
		interceptor = add_header('authorization', f'Bearer {token}')
		channel = grpc.intercept_channel(channel, interceptor)
		self.client = manager_pb2_grpc.HavenStub(channel)

		self.setup()

	def setup(self, key_file: str = None) -> None:
		request = manager_pb2.SetupRequest(key_file=key_file)
		response: manager_pb2.SetupResponse = self.client.Setup(request)

		if hasattr(response, "message") and response.message != "":
			print(response.message)

	def chat_completion(self, worker_name: str, messages: List[manager_pb2.Message], stream: bool = False, max_tokens: int = -1, top_p: float = -1, top_k: int = -1, temperature: float = -1) -> manager_pb2.CompletionResponse or str:
		request = manager_pb2.ChatCompletionRequest(worker_name=worker_name, messages=messages, max_tokens=max_tokens, top_p=top_p, top_k=top_k, temperature=temperature)
		responseStream: manager_pb2.CompletionResponse = self.client.ChatCompletion(request)

		if stream:
			return responseStream
		
		return stream_to_string(responseStream)
	
	def completion(self, worker_name: str, prompt: str, stream: bool = False, max_tokens: int = -1, top_p: float = -1, top_k: int = -1, temperature: float = -1) -> manager_pb2.CompletionResponse or str:
		# TODO: we're currently not using stop_tokens
		request = manager_pb2.CompletionRequest(worker_name=worker_name, prompt=prompt, stop_tokens=[], max_tokens=max_tokens, top_p=top_p, top_k=top_k, temperature=temperature)
		responseStream: manager_pb2.CompletionResponse = self.client.Completion(request)

		if stream:
			return responseStream
		
		return stream_to_string(responseStream)
	
	def list_models(self) -> manager_pb2.ListModelsResponse:
		request = manager_pb2.Empty()
		return self.client.ListModels(request)
	
	def add_model(self, architecture: str, name: str, tokenizer: str, system_prompt: str = None, instruction_prefix: str = None, instruction_postfix: str = None, output_prefix: str = None, output_postfix: str = None) -> manager_pb2.Empty:
		request = manager_pb2.Model(architecture=architecture, name=name, tokenizer=tokenizer, system_prompt=system_prompt, instruction_prefix=instruction_prefix, instruction_postfix=instruction_postfix, output_prefix=output_prefix, output_postfix=output_postfix)
		return self.client.AddModel(request)
	
	def delete_model(self, name: str) -> manager_pb2.Empty:
		request = manager_pb2.ModelName(name=name)
		return self.client.DeleteModel(request)
	
	def list_workers(self) -> manager_pb2.ListWorkersResponse:
		request = manager_pb2.Empty()
		response = self.client.ListWorkers(request)

		# Response is of a weird GRPC type, so we transform it to a list of dicts
		# with worker_name and status as string attributes

		workers = []
		for worker in response.workers:
			# Convert enum to string representation
			status = manager_pb2.Status.Name(worker.status)

			workers.append({
				"worker_name": worker.worker_name,
				"status": status
			})

		return workers
	
	def create_inference_worker(self, model_name: str, quantization: str, worker_name: str = None, gpu_type: manager_pb2.GpuType = None, gpu_count: int = None, zone: str = None) -> manager_pb2.InferenceWorker:
		request = manager_pb2.CreateInferenceWorkerRequest(model_name=model_name, quantization=quantization, worker_name=worker_name, gpu_type=gpu_type, gpu_count=gpu_count, zone=zone)
		response = self.client.CreateInferenceWorker(request)
		return response.worker_name
	
	def pause_inference_worker(self, worker_name: str) -> manager_pb2.InferenceWorker:
		request = manager_pb2.InferenceWorker(worker_name=worker_name)
		return self.client.PauseInferenceWorker(request)
	
	def resume_inference_worker(self, worker_name: str) -> manager_pb2.InferenceWorker:
		request = manager_pb2.InferenceWorker(worker_name=worker_name)
		return self.client.ResumeInferenceWorker(request)
	
	def delete_inference_worker(self, worker_name: str) -> manager_pb2.InferenceWorker:
		request = manager_pb2.InferenceWorker(worker_name=worker_name)
		return self.client.DeleteInferenceWorker(request)
