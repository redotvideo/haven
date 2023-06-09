<script lang="ts">
	import {createPromiseClient} from "@bufbuild/connect";
	import Button from "../../components/form/Button.svelte";
	import FileUpload from "../../components/form/FileUpload.svelte";
	import Input from "../../components/form/Input.svelte";
	import Header from "../../components/page/Header.svelte";
	import Page from "../../components/page/Page.svelte";
	import {authenticationInterceptor, getAddress, isInitialized} from "../../lib/client";
	import {Haven} from "../../lib/client/pb/manager_connect";
	import {createGrpcWebTransport} from "@bufbuild/connect-web";

	let currentPage = isInitialized ? 1 : 0;

	let hostname: string = "";
	let file: File | undefined = undefined;

	async function onSetup() {
		if (!hostname) {
			alert("Please enter a backend address first.");
			return;
		}

		if (!file) {
			alert("Please upload a file first.");
			return;
		}

		// Create a custom client using the hostname for this one request only.
		const transport = createGrpcWebTransport({
			baseUrl: getAddress(hostname),
			interceptors: [authenticationInterceptor],
		});
		const Client = createPromiseClient(Haven, transport);

		const text = await file.text();

		await Client.setup({keyFile: text, serverAddress: hostname})
			.then(() => {
				document.location.href = "/";
			})
			.catch((err) => alert("Something went wrong. " + err.message));
	}
</script>

<Page>
	{#if currentPage === 0}
		<Header text="Welcome!" />
		<div class="mb-8">
			Haven is a resource manager for LLM training and deployments. <br /><br />

			To get started, please enter the address at which your manager backend is running. <br />
			If you're not running Haven with custom settings, this is likely the address at which you're viewing this page.
		</div>
		<Input bind:value={hostname} label="Server hostname" placeholder={`Likely: "${window.location.hostname}"`} />
		<div class="w-full flex justify-end">
			<Button
				label="Next >"
				action={() => {
					currentPage = 1;
				}}
			/>
		</div>
	{:else}
		<div class="mb-8">
			Now, please upload a <b>Google Cloud credentials file</b> with permissions to <b>create VMs</b>
			and to
			<b>create and write to storage buckets</b>. You can read more about the setup process in our documentation.<br
			/><br />
			This file will never be sent anywhere else.
		</div>

		<FileUpload bind:file />
		<div class="mb-8" />
		<div class="w-full flex justify-between">
			<Button label="< Back" action={() => (currentPage = 0)} />
			<Button label="Finish setup >" action={onSetup} />
		</div>
	{/if}
</Page>
