from modal.cli.volume import put, get

import os
from flask import Flask, request

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload():
	json = request.get_json()

	file: str = json['file']
	filename = json['filename']

	with open(filename, 'w') as f:
		f.write(file)

	put("datasets", filename, "/", env=None)

	os.remove(filename)

	return filename

@app.route('/download', methods=['POST'])
def download():
	json = request.get_json()

	filename = json['fileName']
	print("filename: "+filename)

	get("datasets", filename, ".", env=None)

	with open(filename, 'r') as f:
		file = f.read()

	os.remove(filename)

	return file

if __name__ == '__main__':
	# MODAL_CONFIG_PATH=./.modal.toml python run.py
	app.run(debug=False)