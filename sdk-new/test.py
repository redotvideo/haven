from havenpy import Haven

client = Haven("34.116.236.227", "public_github")

result = client.run_sync(client.list_models())

print(result)