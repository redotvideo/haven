<script lang="ts">
	import type { IconName } from "./icons";

	import Download from "./svgs/Download.svelte";
	import Help from "./svgs/Help.svelte";
	import Moon from "./svgs/Moon.svelte";
	import Pie from "./svgs/Pie.svelte";
	import Sun from "./svgs/Sun.svelte";

	export let icon: IconName;
</script>

{#if icon === "download"}
	<Download />
{:else if icon === "pie"}
	<Pie />
{:else if icon === "help"}
	<Help />
{:else if icon === "sun"}
	<Sun />
{:else if icon === "moon"}
	<Moon />
{/if}
