import type {modelsToFinetune} from "./models";

export const inferenceEndpoints: Readonly<Record<(typeof modelsToFinetune)[number], string>> = Object.freeze({
	"HuggingFaceH4/zephyr-7b-beta":
		"https://havenhq--lora-server-huggingfaceh4-zephyr-7b-beta-model--b80943.modal.run/generate_stream",
	"meta-llama/Llama-2-7b-chat-hf":
		"https://havenhq--lora-server-meta-llama-llama-2-7b-chat-hf-model-4eee5b.modal.run/generate_stream",
	"mistralai/Mixtral-8x7b-Instruct-v0.1":
		"https://havenhq--lora-server-mistralai-mixtral-8x7b-instruct-v0--9fe7b9.modal.run/generate_stream",
});

export const exportEndpoint = "https://havenhq--model-export-export.modal.run";

export const trainEndpoint: Readonly<Record<(typeof modelsToFinetune)[number], string>> = {
	"HuggingFaceH4/zephyr-7b-beta": "https://havenhq--finetuning-service-train.modal.run",
	"meta-llama/Llama-2-7b-chat-hf": "https://havenhq--finetuning-service-train.modal.run",
	"mistralai/Mixtral-8x7b-Instruct-v0.1": "https://havenhq--mixtral-finetuning-train.modal.run",
};
