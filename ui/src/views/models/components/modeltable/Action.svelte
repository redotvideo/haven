<script lang="ts">
	import { Action, actions, newStatus } from "../../Models";
	import Loading from "../../../../components/icons/Loading.svelte";
	import { Status } from "../../../../lib/client/pb/manager_pb";

	export let name: string;
	export let status: Status;
	export let updateFunc: (status: Status) => void;

	async function action(action: Action) {
		updateFunc(newStatus[action] as Status);
		await actions[action]({ name });
	}
</script>

{#if status === Status.RUNNING}
	<button
		on:click={() => action(Action.CHAT)}
		class="px-2 py-1 rounded-md font-medium text-blue-600 bg-background-raised hover:bg-highlighted dark:text-blue-400 dark:bg-highlighted-dark dark:hover:bg-border-dark"
		>Chat</button>
	<button
		on:click={() => action(Action.PAUSE)}
		class="px-2 py-1 rounded-md font-medium text-yellow-600 bg-background-raised hover:bg-highlighted dark:text-yellow-400 dark:bg-highlighted-dark dark:hover:bg-border-dark"
		>Pause</button>
	<button
		on:click={() => action(Action.DELETE)}
		class="px-2 py-1 rounded-md font-medium text-red-600 bg-background-raised hover:bg-highlighted dark:text-red-400 dark:bg-highlighted-dark dark:hover:bg-border-dark"
		>Delete worker</button>
{:else if status === Status.STOPPED}
	<button
		on:click={() => action(Action.CREATE)}
		class="px-2 py-1 rounded-md font-medium text-blue-600 bg-background-raised hover:bg-highlighted dark:text-blue-400 dark:bg-highlighted-dark dark:hover:bg-border-dark"
		>Create</button>
{:else if status === Status.PAUSED}
	<button
		on:click={() => action(Action.RESUME)}
		class="px-2 py-1 rounded-md font-medium text-blue-600 bg-background-raised hover:bg-highlighted dark:text-blue-400 dark:bg-highlighted-dark dark:hover:bg-border-dark"
		>Start</button>
	<button
		on:click={() => action(Action.DELETE)}
		class="px-2 py-1 rounded-md font-medium text-red-600 bg-background-raised hover:bg-highlighted dark:text-red-400 dark:bg-highlighted-dark dark:hover:bg-border-dark"
		>Delete worker</button>
{:else if status === Status.STARTING || status === Status.STOPPING}
	<div class="flex items-center">
		<Loading styles="h-4 w-4" />
		<div class="pr-2 py-1 font-medium text-gray-600 dark:text-gray-400">
			Please wait...
		</div>
	</div>
{:else if status === Status.ERROR}
	<button
		on:click={() => action(Action.RETRY)}
		class="px-2 py-1 rounded-md font-medium text-red-600 bg-background-raised hover:bg-highlighted dark:text-red-400 dark:bg-highlighted-dark dark:hover:bg-border-dark"
		>Retry</button>
{/if}
