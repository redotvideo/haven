<script lang="ts">
	import { onMount } from "svelte";
	import { navigate } from "../../navigation";

	onMount(() => {
		navigate("/models");
	});
</script>
