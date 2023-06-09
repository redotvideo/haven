<script lang="ts">
	export let value: string;

	export let label: string;
	export let placeholder: string;
</script>

<div class="mb-6">
	<label for="" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{label}</label>
	<input
		type="text"
		class="bg-background-raised border border-border text-text text-sm rounded-lg block w-full p-2.5 dark:bg-background-raised-dark dark:border-border-dark dark:placeholder-text-accent-dark dark:text-text-dark"
		{placeholder}
		required
		bind:value
	/>
</div>
