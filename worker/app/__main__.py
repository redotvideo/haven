
"""
Worker entry point
"""

from flask import Flask, request
from inference_worker.haven.inference_server import InferenceClient
import os

ABSOLUTE_PATH = os.path.dirname(__file__)


app = Flask(__name__)


inference_client = InferenceClient(config=os.path.join(ABSOLUTE_PATH, "inference_worker/config/mpt_chat_7b.json"), setup_type="16bit")

@app.route("/generate", methods=["POST"])
def echo():
    data = request.get_json()
    prompt = data["prompt"]
    config = data["config"]

    output = inference_client.generate(text_input=prompt, **config)
    
    return output

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)