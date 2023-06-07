from haven import Haven

client = Haven("localhost:50051", "awmzbmspqoadbvkse")
res = client.generate("test2", "Schreibe einen Nachrichtenartikel über die aktuelle Lage in Deutschland.")

for text in res:
	print(text.text, end="", flush=True)