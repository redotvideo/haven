import transformers
from transformers import StoppingCriteria, StoppingCriteriaList, TextIteratorStreamer
import torch
import json
from threading import Thread
from typing import List

from models.model_registry import ModelRegistry



class InferenceClient:
    def __init__(self, config):

        with open(config, 'r') as f:
            self.config = json.load(f)

        self.model_engine = ModelRegistry.REGISTRY[self.config["base_class"]](self.config)
        self.model_engine.prepare_for_inference(int8_quantization=self.config["int8"])
        

    def generate(self, text_input, **kwargs):
        return self.model_engine.generate_stream(text_input, **kwargs)

        

if __name__ == '__main__':
    client = InferenceClient("models/model_configs/mpt_chat_7b_newconfig.json")

    PROMPT = """When someone is very ill or has had surgery that interrupts ordinary ways of eating and drinking, tube feeding is a life-saving necessity, but it’s cumbersome and uncomfortable to use. Luminoah aims to change this with a reinvented tube-feeding device that’s more portable, discreet and easy to use, and it has raised $6 million to bring its design to market.

Ordinary tube feeding setups are generally found in hospitals and are wheeled around like IVs and other gear. That makes sense in a controlled medical environment, but what if you or your loved one has to do it for months in and out of the hospital? Wheeling a tube feeding mechanism around a home or school is much more difficult and probably quite unpleasant.

Luminoah founder Neal Piper was confronted with this issue when his toddler required tube feeding during treatment for cancer (he is fine now, by the way).


“During his treatment, Noah was tethered to a pole-mounted tube feeding system for up to 15 hours per day. This outdated technology limited his mobility, reduced his quality of life, and presented numerous well-documented health risks,” explained Piper in a news release.

This is often the case with medical devices: The old way works fine but hasn’t been updated in years or decades due to the cost of development and complexity of entering the medical device market. Piper and Luminoah seem to have struck a chord with investors, however, leading to this $6 million A round led by Fry’s Path Capital, with participation from Sands Capital, CAV Angels, Virginia Venture Partners and 757 Angels.

“Our system has made substantial improvements to the size of the hardware allowing our engineering team to redefine the traditional approach to IV-pole bound infusion pumps,” Piper told TechCrunch. “Users will enjoy a modern UI/UX that affords them discretion while feeding paired with a device that allows them to go about their day unencumbered.” (As the design of the device is not final, the company is not yet publishing images of it.)

Being a connected device, it would also collect metrics for medical providers to check akin to what they would learn if the patient were in a hospital room with a traditional pole-mounted system.


The plan is to make the device reimbursable by insurance, though it’s a long road to get there. The funding should at least take it to prototype stage.


“With our newly raised round, we will rapidly advance development and prepare for the commercialization of our system. We are excited to grow our team further as we continue to march towards these exciting milestones,” he said.

Quality of life is a genuinely important factor in recovery, especially among young people who have yet to develop the kind of coping mechanisms adults use to get through tough times like cancer treatment. Reducing the discomfort and increasing the dignity of live-preserving treatments isn’t just a “nice to have” — it will likely contribute to better patient outcomes.

Question: Which company has raised money, how much, and from which investor? Very importantly: Please return the response in structured JSON output. Now answer the question and return the response in JSON.
"""
    
    import time
    import torch
    start = time.time()

    #with torch.autocast('cuda'):
    stream = client.generate(PROMPT)
    for s in stream:
        print(s)
    end = time.time()

    print("total", end-start)
