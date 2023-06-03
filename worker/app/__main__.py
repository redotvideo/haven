
"""
Worker entry point
"""

from flask import Flask, request, abort
from inference_worker.haven.inference_server import InferenceClient
import os

ABSOLUTE_PATH = os.path.dirname(__file__)

app = Flask(__name__)
running = True

inference_client = InferenceClient(config=os.path.join(ABSOLUTE_PATH, "inference_worker/config/mpt_chat_7b.json"), setup_type="16bit")

@app.route("/health", methods=["GET"])
def health():
    if not running:
        return abort(500)
    return "OK"

@app.route("/shutdown", methods=["GET"])
def shutdown():
    global running
    running = False
    return "Shutting down..."

@app.route("/generate", methods=["POST"])
def echo():
    data = request.get_json()
    prompt = data["prompt"]
    config = data["config"]

    output = inference_client.generate(text_input=prompt, **config)

    return output


@app.route("/generate", methods=["POST"])
def echo():
    data = request.get_json()
    prompt = data["prompt"]
    config = data["config"]

    streamer = inference_client.generate_stream(text_input=prompt, **config)

    return streamer


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)