<!-- Example of what a breadcrumb is: 
	Home > Products > Product A > Description
-->

<script lang="ts">
	import { navigate } from "../../navigation";

	export let url: string;

	function transform(url: string) {
		const breadcrumb = [];
		let currentPath = "";
		const path = url
			.split("/")
			.filter((x) => x)
			.map((x) => ({
				name: x.charAt(0).toUpperCase() + x.slice(1),
				link: (currentPath += "/" + x),
			}));

		path.map((x) => breadcrumb.push({ name: x.name, link: x.link }));
		return breadcrumb;
	}

	function countLevels(url: string) {
		return url.split("/").filter((x) => x).length;
	}
</script>

<nav class="flex" aria-label="Breadcrumb">
	<ol class="inline-flex items-center space-x-1">
		{#each transform(url) as { name, link }, i}
			<li class="inline-flex items-center">
				<button
					on:click={() => navigate(link)}
					class="inline-flex items-center text-sm font-medium">
					{#if i === 0}
						<!-- "Home" -->
						<svg
							aria-hidden="true"
							class="w-4 h-4 mr-2"
							fill="currentColor"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
							><path
								d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
					{/if}
					{#if i > 0 && i < countLevels(url)}
						<!-- ">" -->
						<svg
							aria-hidden="true"
							class="w-6 h-6 text-gray-400"
							fill="currentColor"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
							><path
								fill-rule="evenodd"
								d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
								clip-rule="evenodd" /></svg>
					{/if}
					{name}
				</button>
			</li>
		{/each}
	</ol>
</nav>
