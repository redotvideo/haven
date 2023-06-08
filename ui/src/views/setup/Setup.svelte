<script lang="ts">
	import Button from "../../components/form/Button.svelte";
	import FileUpload from "../../components/form/FileUpload.svelte";
	import Header from "../../components/page/Header.svelte";
	import Page from "../../components/page/Page.svelte";
	import {Client} from "../../lib/client";
	import {navigate} from "../../lib/navigation";

	let file: File | undefined = undefined;

	async function onSetup() {
		if (!file) {
			alert("Please upload a file first.");
			return;
		}

		const text = await file.text();

		await Client.setup({keyFile: text})
			.then(() => navigate("/"))
			.catch((err) => alert("Something went wrong. " + err.message));
	}
</script>

<Page>
	<Header text="Welcome!" />
	<div class="mb-8">
		Haven is a resource manager for LLM training and deployments. <br /><br />
		To get started, please upload a <b>Google Cloud credentials file</b> with permissions to <b>create VMs</b> and to
		<b>create and write to storage buckets</b>. You can read more about the setup process in our documentation.<br /><br
		/>
		This file will never be sent anywhere else.
	</div>

	<FileUpload bind:file />
	<div class="mb-8" />
	<div class="w-full flex justify-end">
		<Button label="Get started >" action={onSetup} />
	</div>
</Page>
