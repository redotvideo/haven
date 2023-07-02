import argparse
from havenpy import Haven


parser = argparse.ArgumentParser()
parser.add_argument("--manager_url", default="localhost", type=str)
parser.add_argument("--bearer-token", default="insecure", type=str)
parser.add_argument("--model", help="name of the huggingface model")
parser.add_argument("--gpu-type", default="A100", type=str, choices=["T4", "A100"])
parser.add_argument('--gpu-count', default=1, type=int)
parser.add_argument("--quantization", default="float16", choices=["int8", "float16"])
args = parser.parse_args()

client = Haven(args.manager_url+":50051", args.bearer_token)
client.create_inference_worker("@huggingface/"+args.model, quantization=args.quantization, gpu_type=args.gpu_type, gpu_count=args.gpu_count)