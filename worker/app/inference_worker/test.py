from haven.inference_server import InferenceClient

client = InferenceClient("config/mpt_chat_7b.json", setup_type="T4_8bit")
output = client.generate("Hey, schlag mir bitte ein paar Date Ideen vor! Was koennte ich mit meiner Freundin machen?")

print("output", output)
