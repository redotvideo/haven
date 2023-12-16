import * as y from "yup";

export const bodySchema = y.object({
	modelId: y.string().required(),
	history: y
		.array(
			y.object({
				role: y.string().oneOf(["user", "system", "assistant"]).required(),
				content: y.string().required(),
			}),
		)
		.required(),
	parameters: y.object({
		temperature: y.number().min(0).max(1.5).required(),
		topP: y.number().min(0).max(1).required(),
		maxTokens: y.number().min(10).max(2048).required(),
		repetitionPenalty: y.number().min(1).max(1.8).required(),
		doSample: y.boolean().required(),
	}),
});
