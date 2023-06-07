<script lang="ts">
	import { Client } from "../../lib/client/index";

	export let model: string;

	const icon1 = "/profile.jpeg";
	const icon2 = "/icon.svg";

	let messages = [];
	let loading = false;

	const onHumanInput = async (message: string) => {
		loading = true;

		console.log(`Getting prediction for model ${model} and message ${message}`);
		const data = await Client.generate({
			model: model,
			prompt: message,
		});

		const id = new Date().getTime().toString();

		// data is an async iterable
		for await (const part of data) {
			// initially create a new message, from the second one on, only update it
			const index = messages.findIndex((m) => m.id === id);
			const text = part.text;

			if (index === -1) {
				messages = [
					...messages,
					{
						id,
						icon: icon2,
						text: text,
						isFromAi: true,
					},
				];
			} else {
				const newText = messages[index]["text"] + text;
				messages = [
					...messages.slice(0, index),
					{
						...messages[index],
						text: newText,
					},
					...messages.slice(index + 1),
				];
			}
		}

		loading = false;
	};

	let value = "";
</script>

<div>
	<!-- Messages -->
	{#each messages as message}
		<div
			class={`flex items-center p-6 ${
				message.isFromAi
					? "bg-background-raised dark:bg-background-raised-dark"
					: ""
			}`}>
			<img class="h-10 w-10 rounded-sm" src={message.icon} alt="" />
			<div class="ml-5 whitespace-pre-line">
				{message.text}
			</div>
		</div>
	{/each}
	<div class="h-20" />

	<!-- Chat text field -->
	<div
		class="absolute pt-10 sm:pl-64 w-full bottom-0 left-0 pb-5 bg-gradient-to-t from-background to-transparent dark:from-background-dark">
		<form
			on:submit|preventDefault={() => {
				messages = [
					...messages,
					{
						icon: icon1,
						text: value,
						isFromAi: false,
					},
				];
				onHumanInput(value);
				value = "";
			}}>
			<input type="submit" style="display: none" />

			<div class="flex place-content-center">
				<div
					class="flex flex-grow max-w-2xl mr-5 ml-5 bg-background-raised dark:bg-background-raised-dark border border-border dark:border-border-dark">
					<input
						id="message"
						class="p-2.5 w-full placeholder:text-text text-sm bg-background-raised focus:outline-none dark:placeholder:text-text-dark dark:bg-background-raised-dark"
						placeholder="Write your thoughts here..."
						autocomplete="off"
						bind:value />
					<button
						class="p-2 bg-background-raised dark:bg-background-raised-dark">
						<svg
							stroke="currentColor"
							fill="none"
							stroke-width="2"
							viewBox="0 0 24 24"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-4 w-4 mr-1"
							height="1em"
							width="1em"
							xmlns="http://www.w3.org/2000/svg">
							<line x1="22" y1="2" x2="11" y2="13" /><polygon
								points="22 2 15 22 11 13 2 9 22 2" /></svg
						></button>
				</div>
			</div>
		</form>
	</div>
</div>
