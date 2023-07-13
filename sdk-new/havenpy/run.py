from .haven import HavenStub, SetupRequest, SetupResponse, ChatCompletionRequest, CompletionResponse, ListModelsResponse, Message, Empty

import asyncio
from grpclib.client import Channel

from typing import List

class Haven:
	client: HavenStub

	def __init__(self, url: str, token: str):
		channel = Channel(host=url, port=50051)
		self.client = HavenStub(channel, metadata=(("authorization", f"Bearer {token}"),))

		self.run_sync(self.setup())

	async def setup(self, key_file: str = None) -> None:
		request = SetupRequest(key_file=key_file)
		response: SetupResponse = await self.client.setup(request)

		if hasattr(response, "message") and response.message != "":
			print(response.message)

	async def chat_completion(
		self,
		worker_name: str,
		messages: List[Message],
		stream: bool = False,
		max_tokens: int = -1,
		top_p: float = -1,
		top_k: int = -1,
		temperature: float = -1
	) -> CompletionResponse or str:
		request = ChatCompletionRequest(
			worker_name=worker_name,
			messages=messages,
			max_tokens=max_tokens,
			top_p=top_p,
			top_k=top_k,
			temperature=temperature
		)
		responseStream: CompletionResponse = await self.client.chat_completion(request)

		if stream:
			return responseStream

		return responseStream.text

	async def list_models(self) -> ListModelsResponse:
		request = Empty()
		result = await self.client.list_models(request)
		return result.to_dict()["models"]

	def run_sync(self, coroutine: asyncio.coroutine):
		return asyncio.get_event_loop().run_until_complete(coroutine)
	
"""async def main():
	channel = Channel(host="localhost", port=50051)

	# Set an Authorization header with content "Bearer <token>"
	client = haven.HavenStub(channel, metadata=(("authorization", "Bearer insecure"),))

	request = haven.SetupResponse()
	response = await client.setup(request)

	print(response.to_dict())

	channel.close()

if __name__ == '__main__':
	import asyncio
	asyncio.run(main())"""