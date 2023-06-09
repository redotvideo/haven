<script lang="ts">
	import {Router, Route} from "svelte-routing";
	import {isDark} from "./lib/darkMode";
	import {checkSetup} from "./lib/setup";

	import Sidenav from "./components/sidenav/Sidenav.svelte";
	import Chat from "./views/chat/Chat.svelte";
	import Models from "./views/models/Models.svelte";
	import Topnav from "./components/topnav/Topnav.svelte";
	import Redirect from "./components/redirect/Redirect.svelte";
	import Setup from "./views/setup/Setup.svelte";
	import {onMount} from "svelte";
	import {isInitialized} from "./lib/client";
	import {navigate} from "./lib/navigation";

	export let url = "";

	onMount(async () => {
		if (!isInitialized) {
			navigate("/setup");
		}

		// Checks if the manager is set up.
		await checkSetup();
	});
</script>

<!-- Dark mode wrapper -->
<div class={`h-screen ${$isDark ? "dark" : ""}`}>
	<div
		class="text-text dark:text-text-dark overflow-hidden w-full h-full relative z-0 bg-background dark:bg-background-dark"
	>
		<Sidenav />
		<div class="overflow-y-auto h-full md:ml-64">
			<Topnav />
			<Router {url}>
				<Route path="/" component={Redirect} />
				<Route path="/models" component={Models} />

				<!-- TODO(konsti): create info page for models -->
				<Route path="/models/:model" component={Redirect} />

				<Route path="/models/:model/chat" component={Chat} />

				<Route path="/setup" component={Setup} />
				<!--<Route path="/resources" component={Resources} />-->
			</Router>
		</div>
	</div>
</div>
