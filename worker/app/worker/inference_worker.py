from .models.model_registry import ModelRegistry

class InferenceClient:
    def __init__(self, config):
        self.config = config
        self.model_engine = ModelRegistry.REGISTRY[self.config["architecture"]](self.config)
        self.model_engine.prepare_for_inference()

    def complete_chat(self, messages, inference_params):
        prompt = self.model_engine.generate_stream(messages)
        return self.model_engine.generate_stream(prompt, **inference_params)
    
    def complete(self, prompt, inference_params):
        return self.model_engine.generate_stream(prompt, **inference_params)
    