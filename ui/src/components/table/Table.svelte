<script lang="ts">
	export let titleMap;
	export let rows;

	const keys = Object.keys(rows[0]);
	keys.pop();
</script>

<main>
	<div
		class="rounded-lg relative overflow-x-auto border-border border dark:border-border-dark">
		<table class="w-full text-sm text-left">
			<thead
				class="text-xs uppercase bg-background-raised dark:bg-highlighted-dark">
				<tr>
					{#each Object.keys(rows[0]) as column}
						<th class="px-6 py-3">{titleMap[column]}</th>
					{/each}
					<th class="px-6 py-3">Status</th>
				</tr>
			</thead>
			<tbody class="dark:bg-background-raised-dark">
				<!-- Create dynamically using the elements array. Use a button for the action -->
				{#each rows as element}
					<tr class="border-t border-border dark:border-border-dark">
						{#each keys as column}
							<td class="px-6 py-4 font-medium whitespace-nowrap"
								>{element[column]}</td>
						{/each}
						<td class="px-6 py-4">
							<button
								on:click={element.action}
								class="font-medium text-blue-600">Chat</button>
						</td>
						<td class="px-6 py-4 text-green-700 flex items-center">
							<div class="h-2 w-2 bg-green-700 rounded-lg mr-2" />
							Online
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>
