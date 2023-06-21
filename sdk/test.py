from havenllm import Haven

client = Haven("localhost:50051", "awmzbmspqoadbvkse")

client.create_inference_worker(model_name="example-base", quantization="float16", gpu_type="A100", gpu_count=1)

"""res = client.generate("test2", "Schreibe einen Nachrichtenartikel über die aktuelle Lage in Deutschland.", stream=True)
for r in res:
	print(r.text)

res = client.generate("test2", "Schreibe einen Nachrichtenartikel über die aktuelle Lage in Deutschland.", stream=False)
print(res)"""
