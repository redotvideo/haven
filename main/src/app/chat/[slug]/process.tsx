import * as y from "yup";

export type ChatMessage = {
	role: "user" | "assistant" | "system";
	content: string;
};

export async function processChunk(current: string, newChat: ChatMessage[], setChat: (chat: ChatMessage[]) => void) {
	// Split the stream into lines
	const lines = current.split("\n\n");

	if (lines.length === 0) {
		return "";
	}

	// Check if the last line is incomplete
	const lastLineIsIncomplete = await Promise.resolve(lines[lines.length - 1]!.slice(5))
		.then((line) => {
			JSON.parse(line);
			return false;
		})
		.catch(() => true);

	const linesToProcess = lastLineIsIncomplete ? lines.slice(0, -1) : lines;

	// JSON parse all but the last line
	for (const line of linesToProcess) {
		if (!line) {
			continue;
		}

		const schema = y.object({
			// Our multi lora server provides this
			token: y
				.object({
					text: y.string(),
					special: y.boolean(),
				})
				.required(),
			// Fireworks AI provides this
			choices: y.array(
				y.object({
					index: y.number(),
					delta: y.object({
						content: y.string(),
					}),
				}),
			),
		});

		// Line starts with "data:", skip it
		const validated = await Promise.resolve()
			.then(() => schema.validate(JSON.parse(line.slice(5))))
			.catch(() => undefined);

		// Multi lora
		if (validated && Object.keys(validated.token).length > 0) {
			// Ignore special tokens
			if (validated.token.special) {
				continue;
			}

			// Add the message to the chat
			const current = newChat[newChat.length - 1]!;
			current.content += validated.token.text;
			setChat([...newChat.slice(0, -1), current]);
		}

		// Fireworks AI
		if (validated?.choices && Object.keys(validated.choices).length > 0) {
			const current = newChat[newChat.length - 1]!;

			if (!validated.choices[0]?.delta.content) {
				continue;
			}

			current.content += validated.choices[0].delta.content;
			setChat([...newChat.slice(0, -1), current]);
		}
	}

	if (lastLineIsIncomplete) {
		// Carry over
		return lines[lines.length - 1]!;
	}

	return "";
}

export async function parseStream(
	reader: ReadableStreamDefaultReader<Uint8Array>,
	newChat: ChatMessage[],
	setChat: (chat: ChatMessage[]) => void,
) {
	let current = "";

	// Iterate over the stream
	while (true) {
		const {done, value} = await reader.read();

		const decoded = new TextDecoder("utf-8").decode(value);

		current += decoded;
		current = await processChunk(current, newChat, setChat);

		if (done) {
			break;
		}
	}
}
