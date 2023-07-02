from havenpy import Haven
import asyncio

client = Haven("localhost:50051", "insecure")


res = client.chat_completion("haven-w-open-llama-7b-open-instruct-ljjm2jii", messages=[{"role": "USER", "content": "Why should companies deploy large language models on their own infrastructure rather than using third party APIs?"}], stream=True)
for r in res:
    print(r.text, end="", flush=True)


