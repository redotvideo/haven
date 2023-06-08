import grpc

from .interceptor import add_header
from .pb import manager_pb2_grpc, manager_pb2

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

	def generate(self, model: str, prompt: str) -> manager_pb2.GenerateResponse:
		request = manager_pb2.GenerateRequest(model=model, prompt=prompt)
		return self.client.Generate(request)
	
	def list_models(self) -> manager_pb2.ListModelsResponse:
		request = manager_pb2.Empty()
		return self.client.ListModels(request)
	
	def create_worker(self, model_name: str) -> manager_pb2.Empty:
		request = manager_pb2.ModelName(model_name=model_name)
		return self.client.CreateWorker(request)
	
	def pause_worker(self, model_name: str) -> manager_pb2.Empty:
		request = manager_pb2.ModelName(model_name=model_name)
		return self.client.PauseWorker(request)
	
	def resume_worker(self, model_name: str) -> manager_pb2.Empty:
		request = manager_pb2.ModelName(model_name=model_name)
		return self.client.ResumeWorker(request)
	
	def delete_worker(self, model_name: str) -> manager_pb2.Empty:
		request = manager_pb2.ModelName(model_name=model_name)
		return self.client.DeleteWorker(request)
