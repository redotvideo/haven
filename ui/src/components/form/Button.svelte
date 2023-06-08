<script lang="ts">
	export let label: string;
	export let action: () => void;
</script>

<button
	class="px-3 py-2 font-bold bg-background-raised dark:bg-background-raised-dark hover:bg-highlighted dark:hover:bg-highlighted-dark rounded-lg"
	on:click={action}>{label}</button
>
