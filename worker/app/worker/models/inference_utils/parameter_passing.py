from typing import Dict

def get_inference_parameter_dict(params: Dict):
    inference_params = dict()

    for p in params.keys():
        if params[p] != -1:
            inference_params[p] = params[p]

    return inference_params
