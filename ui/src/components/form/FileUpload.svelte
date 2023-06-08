<script lang="ts">
	export let file: File | undefined = undefined;

	function turnGray(node: HTMLElement) {
		node.classList.remove("bg-green-100");
		node.classList.remove("dark:bg-teal-950");

		node.classList.add("bg-background-raised");
		node.classList.add("dark:bg-background-raised-dark");
	}

	function turnGreen(node: HTMLElement) {
		node.classList.remove("bg-background-raised");
		node.classList.remove("dark:bg-background-raised-dark");

		node.classList.add("bg-green-100");
		node.classList.add("dark:bg-teal-950");
	}

	function onDragOver(e) {
		e.preventDefault();
		e.stopPropagation();

		e.dataTransfer.dropEffect = "copy";
		turnGreen(e.currentTarget);
	}

	function onDragOverEnd(e) {
		e.preventDefault();
		e.stopPropagation();

		turnGray(e.currentTarget);
	}

	function fileAdded(newFile: File, node: HTMLElement) {
		file = newFile;

		node.classList.remove("hover:bg-highlighted");
		node.classList.remove("dark:hover:bg-highlighted-dark");

		turnGreen(node);
	}

	function onDrop(e) {
		e.preventDefault();
		e.stopPropagation();

		const files = e.dataTransfer.files;

		if (files.length > 0) {
			fileAdded(files[0], e.currentTarget);
		}
	}

	function onFileChange(e) {
		const files = e.currentTarget.files;

		if (files.length > 0) {
			const parent = e.currentTarget.parentElement;
			fileAdded(files[0], parent);
		}
	}
</script>

<div class="flex items-center justify-center w-full">
	<label
		for="dropzone-file"
		class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-background-raised dark:hover:bg-highlighted-dark dark:bg-background-raised-dark hover:bg-highlighted dark:border-gray-600 dark:hover:border-gray-500"
		on:dragover={onDragOver}
		on:dragleave={onDragOverEnd}
		on:drop={onDrop}
	>
		<div class="flex flex-col items-center justify-center pt-5 pb-6">
			<svg
				aria-hidden="true"
				class="w-10 h-10 mb-3"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
				/></svg
			>
			{#if file === undefined}
				<p class="mb-2 text-sm">
					<span class="font-semibold">Click to upload</span> or drag and drop
				</p>
				<p class="text-xs">Google Cloud Service Account File (.json)</p>
			{:else}
				<p class="mb-2 text-sm">
					Selected File: <span class="font-semibold">{file.name}</span>
				</p>
				<p class="text-xs">Click or drag and drop to change file.</p>
			{/if}
		</div>
		<input id="dropzone-file" type="file" class="hidden" on:change={onFileChange} />
	</label>
</div>
