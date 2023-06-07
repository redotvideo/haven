<script lang="ts">
	import { Status } from "../../../../lib/client/pb/manager_pb";

	export let status: Status;

	const colors = {
		[Status.RUNNING]: "green-700", // bg-green-700 , text-green-700
		[Status.STOPPED]: "red-700", // bg-red-700 , text-red-700
		[Status.STARTING]: "yellow-600", // bg-yellow-600 , text-yellow-600
		[Status.STOPPING]: "yellow-600",
		[Status.PAUSED]: "red-700",
		[Status.ERROR]: "red-700",
	};

	// Get string presentation of Status.RUNNING
	console.log(Status[Status.RUNNING]);
</script>

<div class={`flex items-center text-${colors[status]}`}>
	<div class={`h-2 w-2 bg-${colors[status]} rounded-lg mr-2`} />
	{Status[status][0].toUpperCase() + Status[status].slice(1).toLowerCase()}
</div>
