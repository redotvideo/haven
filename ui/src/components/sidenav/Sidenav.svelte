<script lang="ts">
	import {navigate} from "../../lib/navigation";
	import Icon from "../icons/Icon.svelte";
	import type {IconName} from "../icons/icons";
	import Logo from "../icons/Logo.svelte";
	import {navbarOpen} from "./Sidenav";

	const menu: {
		name: string;
		icon: IconName;
		route: string;
		dropdown?: {
			name: string;
			route: string;
		}[];
	}[] = [
		{
			name: "Models",
			icon: "download",
			route: "/models",
		},
	];
</script>

<aside
	id="default-sidebar"
	class={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform bg-background-raised dark:bg-background-raised-dark ${
		$navbarOpen ? "" : "-translate-x-full md:translate-x-0"
	}`}
	aria-label="Sidenav"
>
	<div class="overflow-y-auto h-full border-r border-border dark:border-border-dark">
		<ul class="pl-4 pt-4 pb-2">
			<Logo />
		</ul>
		<ul class="space-y-2">
			<!-- For each entry in menu -->
			{#each menu as item}
				<li class="m-2">
					<button
						on:click={() => navigate(item.route)}
						class="flex w-full items-center p-2 pl-3 text-base font-normal text-text rounded-md dark:text-text-dark hover:bg-highlighted dark:hover:bg-highlighted-dark group"
					>
						<Icon icon={item.icon} />
						<span class="ml-3">{item.name}</span>
					</button>

					<!-- TODO: If the entry has a dropdown -->
					{#if item.dropdown}
						<div />
					{/if}
				</li>
			{/each}
		</ul>
	</div>

	<!-- Bottom Buttons -->
	<div
		class="absolute bottom-0 left-0 justify-center space-x-4 w-full flex z-20 border-r border-t border-border dark:border-border-dark"
	>
		<button
			on:click={() => window.open("mailto://konsti@havenllm.com")}
			class="flex w-full items-center m-2 p-2 pl-3 text-base font-normal text-text rounded-md dark:text-text-dark hover:bg-highlighted dark:hover:bg-highlighted-dark group"
		>
			<Icon icon="help" />
			<span class="ml-3">Help</span>
		</button>
	</div>
</aside>

<!-- Clickable background to close sidebar again -->
{#if $navbarOpen}
	<div
		on:click={() => navbarOpen.set(false)}
		class="bg-background-raised bg-opacity-50 dark:bg-background-raised-dark dark:bg-opacity-80 fixed inset-0 z-30"
	/>
{/if}
