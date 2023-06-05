import os

import asyncio
import grpc

from app.pb import worker_pb2, worker_pb2_grpc
from app.inference_worker.haven.inference_server import InferenceClient

ABSOLUTE_PATH = os.path.dirname(__file__)
inference_client = InferenceClient(config=os.path.join(ABSOLUTE_PATH, "inference_worker/config/mpt_chat_7b.json"), setup_type="16bit")
running = True

class WorkerService(worker_pb2_grpc.WorkerServiceServicer):

	def Health(self, request, context):
		global running
		status = worker_pb2.Status.OK if running else worker_pb2.Status.STOPPING
		return worker_pb2.HealthResponse(status=status)

	def Shutdown(self, request, context):
		global running
		running = False
		return worker_pb2.ShutdownResponse()

	async def GenerateStream(self, request, context):
		prompt = request.prompt
		streamer = inference_client.generate_stream(text_input=prompt)

		for text in streamer:
			yield worker_pb2.GenerateResponse(text=text)

async def serve():
	server = grpc.aio.server()
	worker_pb2_grpc.add_WorkerServiceServicer_to_server(WorkerService(), server)
	listen_address = '[::]:50051'  # Set your desired listening address
	server.add_insecure_port(listen_address)
	await server.start()
	await server.wait_for_termination()

if __name__ == '__main__':
	print("starting server...")
	asyncio.run(serve())