import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
	// Consult https://svelte.dev/docs#compile-time-svelte-preprocess
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	// So we can use on:click outside of buttons
	onwarn: (warning, handler) => {
		if (warning.code === "a11y-click-events-have-key-events") return;
		handler(warning);
	},
};
