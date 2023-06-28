from havenllm import Haven

client = Haven("localhost:50051", "insecure")

print(client.list_workers())

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
