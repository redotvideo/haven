// Exporting the selection of models both to the client side and the server side code.
export const defaultModelLoopup = Object.freeze({
	"mixtral-8x7b": "mistralai/Mixtral-8x7b-Instruct-v0.1",
	zephyr: "HuggingFaceH4/zephyr-7b-beta",
	"llama2-7b": "meta-llama/Llama-2-7b-chat-hf",
});

export const modelsToFinetune = Object.values(defaultModelLoopup);
export const modelIds = Object.keys(defaultModelLoopup);

export type Models = (typeof modelsToFinetune)[number];
