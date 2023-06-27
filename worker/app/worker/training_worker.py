import json

from models.model_registry import ModelRegistry



class TrainingClient:
    def __init__(self, config):

        with open(config, 'r') as f:
            self.config = json.load(f)

        self.model_engine = ModelRegistry.REGISTRY[self.config["base_class"]](self.config)
        self.model_engine.prepare_model_for_training()
        self.model_engine.prepare_data_for_training()


    def train(self):
        self.model_engine.train()

