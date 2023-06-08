<script lang="ts">
	import {onMount} from "svelte";
	import {navigate} from "../../lib/navigation";

	onMount(() => {
		navigate("/models");
	});
</script>
