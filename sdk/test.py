from havenpy import Haven

client = Haven("localhost:50051", "insecure")

with open("./key.json", "r") as f:
	client.setup(f.read())

"""arr = client.list_workers()
for a in arr.workers:
	print("DELETE ", a.worker_name)
	client.delete_inference_worker(a.worker_name)"""


    
# print(client.create_inference_worker(model_name="@huggingface/mosaicml/mpt-7b-chat", quantization="float16", gpu_type="A100", gpu_count=1))
"""
print(client.create_inference_worker(model_name="@huggingface/mosaicml/mpt-7b-chat", quantization="float16", gpu_type="T4", gpu_count=1))

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

# print(client.list_models())

print(client.list_models())

"""res = client.chat_completion("haven-redpajama-incite-chat-3b-v1-ljgvq2o1", messages=[{
    "content": "Write a newspaper article about Marc Zuckerberg.",
    "role": "USER"
}], stream=True)

for r in res:
    print(r.text, end="", flush=True)"""

# print(client.create_inference_worker(model_name="@huggingface/togethercomputer/RedPajama-INCITE-Chat-3B-v1", quantization="float16", gpu_type="T4", gpu_count=1))

"""history = []

history.append({
	"content": my_description,
	"role": "USER"
})

while True:
	res = client.chat_completion("haven-redpajama-incite-chat-3b-v1-ljg7qwku", messages=history, stream=True)
	message = ""
	for r in res:
		message += r.text
		print(r.text, end="", flush=True)
	
	print()

	history.append({
		"content": message,
		"role": "ASSISTANT"
	})

	user_input = input("Your response: ")
	history.append({
		"content": user_input,
		"role": "USER"
	})"""

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
