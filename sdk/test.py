from havenllm import Haven

client = Haven("localhost:50051", "insecure")

"""arr = client.list_workers()
for a in arr.workers:
	print("DELETE ", a.worker_name)
	client.delete_inference_worker(a.worker_name)"""
    
"""
print(client.create_inference_worker(model_name="@huggingface/mosaicml/mpt-7b-chat", quantization="float16", gpu_type="A100", gpu_count=1))
print(client.create_inference_worker(model_name="@huggingface/mosaicml/mpt-7b-chat", quantization="float16", gpu_type="T4", gpu_count=1, worker_name="haven-sex"))

print(client.create_inference_worker(model_name="@huggingface/mosaicml/mpt-7b-instruct", quantization="float16", gpu_type="A100", gpu_count=1))

print(client.create_inference_worker(model_name="@huggingface/h2oai/h2ogpt-gm-oasst1-en-2048-falcon-7b-v2", quantization="int8", gpu_type="T4", gpu_count=1))
print(client.create_inference_worker(model_name="@huggingface/h2oai/h2ogpt-gm-oasst1-en-2048-falcon-7b-v2", quantization="float16", gpu_type="T4", gpu_count=1))
print(client.create_inference_worker(model_name="@huggingface/h2oai/h2ogpt-gm-oasst1-en-2048-falcon-7b-v2", quantization="float16", gpu_type="A100", gpu_count=1))

print(client.create_inference_worker(model_name="@huggingface/togethercomputer/RedPajama-INCITE-Chat-3B-v1", quantization="float16", gpu_type="T4", gpu_count=1))
"""

"""client.chat_completion("haven-example-base-lj7ieyhi", messages=[{
    "content": "Give me a recipe for cake!",
    "role": "USER"
}], stream=True)"""

#key_file = open("key.txt", "r")
#client.setup(key_file=key_file.read())

# client.create_inference_worker(model_name="@huggingface/mosaicml/mpt-7b-chat", quantization="float16", gpu_type="A100", gpu_count=1)
#res = client.generate("haven-example-base-lj7ieyhi", "Give me a recipe for cake!", stream=True)

#for r in res:
	#print(r.text)

# client.pause_inference_worker("haven-example-base-lj7ieyhi")
#client.resume_inference_worker("haven-example-base-lj7ieyhi")

# client.delete_inference_worker("haven-example-base-lj7ieyhi")

# res = client.generate("test2", "Schreibe einen Nachrichtenartikel über die aktuelle Lage in Deutschland.", stream=False)
# print(res)"""
