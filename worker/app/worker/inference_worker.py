from .models.model_registry import ModelRegistry

class InferenceClient:
    def __init__(self, config):
        self.config = config
        self.model_engine = ModelRegistry.REGISTRY[self.config["architecture"]](self.config)
        self.model_engine.prepare_for_inference()

    def complete_chat(self, messages, inference_params):
        prompt = self.model_engine.create_prompt_from_messages(messages)
        return self.model_engine.generate_stream(prompt, **inference_params)
    
    def complete(self, prompt, stop_tokens, inference_params):
        return self.model_engine.generate_stream(prompt, stop_tokens=stop_tokens, **inference_params)
    