<script>
	import {path} from "../../lib/navigation";
	import {isDark} from "../../lib/darkMode";

	import Breadcrumbs from "./Breadcrumbs.svelte";
	import {navbarOpen} from "../sidenav/Sidenav";
	import Icon from "../icons/Icon.svelte";
</script>

<div
	class="sticky top-0 flex justify-between bg-background-raised border-border border-b dark:bg-background-raised-dark dark:border-border-dark"
>
	<!-- Sidebar open button -->
	<div class="p-4 pt-6 pb-6 h-3 flex items-center">
		<button
			class="p-2 mr-3 rounded-lg hover:bg-highlighted text-text-accent dark:text-text-accent-dark dark:hover:bg-highlighted-dark md:hidden"
			on:click={() => navbarOpen.set(true)}
		>
			<svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M1 1H16.6685" stroke="currentColor" stroke-width="1.79589" stroke-linecap="round" />
				<path d="M1 13.5713H16.6685" stroke="currentColor" stroke-width="1.79589" stroke-linecap="round" />
				<path d="M1 7.28563L16.9999 7.2857" stroke="currentColor" stroke-width="1.79589" stroke-linecap="round" />
			</svg>
		</button>

		<Breadcrumbs url={$path} />
	</div>
	<button
		class="mr-2 p-2 rounded-lg hover:bg-highlighted dark:hover:bg-highlighted-dark group"
		on:click={() => isDark.set(!$isDark)}
	>
		<Icon icon={$isDark ? "sun" : "moon"} />
	</button>
</div>
