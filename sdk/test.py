from havenllm import Haven

client = Haven("localhost:50051", "awmzbmspqoadbvkse")

# Read file at ./key.json
#with open("./key.json", "r") as f:
	#client.setup(f.read())




res = client.generate("test2", "Schreibe einen Nachrichtenartikel über die aktuelle Lage in Deutschland.", stream=True)
for r in res:
	print(r.text)

res = client.generate("test2", "Schreibe einen Nachrichtenartikel über die aktuelle Lage in Deutschland.", stream=False)
print(res)
