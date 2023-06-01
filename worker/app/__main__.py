
"""
Worker entry point
"""

from flask import Flask, request

app = Flask(__name__)

@app.route("/")
def hello():
    return "HELLO!"

@app.route("/echo", methods=["POST"])
def echo():
    data = request.get_json()
    return data

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)