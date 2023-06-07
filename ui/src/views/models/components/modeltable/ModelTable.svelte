<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import Loading from "../../../../components/icons/Loading.svelte";
	import Action from "./Action.svelte";
	import StatusLabel from "./Status.svelte";
	import { Client } from "../../../../lib/client/index";
	import type { Status } from "../../../../lib/client/pb/manager_pb";

	let loading = true;
	let rows = [];

	let interval = -1;

	function startPolling() {
		return setInterval(async () => {
			if (interval === -1) {
				return;
			}
			console.log(`${new Date().toLocaleTimeString()} - Refreshing models`);
			rows = (await Client.listModels({})).models;
		}, 5000);
	}

	function updateRow(name: string) {
		return (status: Status) => {
			// Stop interval for 10s
			console.log(
				`${new Date().toLocaleTimeString()} - Stopping polling for 10s`,
			);
			clearInterval(interval);
			interval = -1;

			setTimeout(() => {
				interval = startPolling();
			}, 10000);

			const row = rows.find((row) => row.name === name);
			if (row) {
				row.status = status;
			}
			rows = [...rows];
		};
	}

	onMount(async () => {
		rows = (await Client.listModels({})).models;
		interval = startPolling();
		loading = false;
	});

	onDestroy(() => {
		if (interval === -1) {
			return;
		}
		clearInterval(interval);
	});
</script>

<main>
	<div
		class="rounded-lg relative overflow-x-auto border-border border dark:border-border-dark">
		<table class="w-full text-sm text-left whitespace-nowrap">
			<thead
				class="text-xs uppercase bg-background-raised dark:bg-highlighted-dark">
				<tr>
					<th class="px-6 py-3">Name</th>
					<th class="px-6 py-3">Status</th>
					<th class="px-6 py-3">Action</th>
				</tr>
			</thead>
			{#if loading}
				<!-- Loading -->
				<tbody class="dark:bg-background-raised-dark">
					<tr>
						<td colspan="3">
							<div class="h-16 flex w-full place-content-center items-center">
								<Loading styles="h-6 w-6" />
								<div class="font-medium">Loading...</div>
							</div>
						</td>
					</tr>
				</tbody>
			{:else}
				<!-- Actual body -->
				<tbody class="dark:bg-background-raised-dark">
					<!-- Create dynamically using the elements array. Use a button for the action -->
					{#each rows as element}
						<tr class="border-t border-border dark:border-border-dark">
							<td class="px-6 py-4 font-medium whitespace-nowrap"
								>{element.name}</td>
							<td class="px-6 py-4 w-32">
								<StatusLabel status={element.status} />
							</td>
							<td class="px-6 py-4 w-64">
								<Action
									name={element.name}
									status={element.status}
									updateFunc={updateRow(element.name)} />
							</td>
						</tr>
					{/each}
				</tbody>
			{/if}
		</table>
	</div>
</main>
