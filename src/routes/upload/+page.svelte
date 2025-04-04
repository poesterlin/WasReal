<script lang="ts">
	import { goto } from '$app/navigation';
	import { getWorkerInstance } from '$lib/worker/helper';
	import { IconUpload } from '@tabler/icons-svelte';

	let dragActive = $state(false);
	let fileInput = $state<HTMLInputElement>();
	let filesStored = $state(0);

	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		dragActive = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		dragActive = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragActive = false;

		if (e.dataTransfer?.files) {
			const file = e.dataTransfer.files[0];
			if (file?.type === 'application/zip' || file?.name.endsWith('.zip')) {
				processZipFile(file);
			}
		}
	}

	function handleFileSelect() {
		const file = fileInput?.files?.[0];
		if (file) {
			processZipFile(file);
		}
	}

	async function processZipFile(file: File) {
		const worker = await getWorkerInstance();
		worker.readZip(file).then(() => {
			goto('/posts');
		});

		let running = true;
		while (running) {
			await new Promise((resolve) => setTimeout(resolve, 100));
			const progress = await worker.getProgress();
			filesStored = progress.filesStored;
		}
	}
</script>

<div class="flex h-screen items-center justify-center">
	<div
		class="glass-effect relative container rounded-2xl border-2 border-white/30 p-10 text-center shadow-xl transition-all duration-300 {dragActive
			? 'scale-102 border-red-400/60 bg-red-200/80 shadow-2xl'
			: ''}"
		ondragenter={handleDragEnter}
		ondragleave={handleDragLeave}
		ondragover={(e) => e.preventDefault()}
		ondrop={handleDrop}
		role="button"
		tabindex="0"
	>
		<input
			type="file"
			accept=".zip"
			class="hidden"
			bind:this={fileInput}
			onchange={handleFileSelect}
		/>

		{#if filesStored > 0}
			<div class="text-xl text-black">
				{Math.floor(filesStored / 2)} Posts found
			</div>
		{:else}
			<div class="space-y-6">
				<button
					class="mx-auto flex justify-center text-5xl text-black/80"
					onclick={() => fileInput!.click()}
				>
					<IconUpload class="h-auto w-20" />
				</button>
				<div class="space-y-4">
					<p class="text-xl font-medium text-black">Drop your ZIP file here</p>
					<p class="text-sm text-black/80">or</p>
					<button
						class="rounded-full border border-white/30 bg-black px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-black/70 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none"
						onclick={() => fileInput!.click()}
					>
						Select File
					</button>
				</div>

				<p class="text-sm text-black/70">Only ZIP files are accepted ✨</p>
				<p class="text-sm text-black/70">
					The data is processed locally in your browser.<br /> No data is sent to any server.
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		width: min(90%, 500px);
	}
</style>
