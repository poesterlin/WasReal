<script lang="ts">
	import { goto } from '$app/navigation';
	import { getWorkerInstance } from '$lib/worker/helper';

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
			<div class="text-xl text-white">
				{Math.floor(filesStored / 2)} Posts found
			</div>
		{:else}
			<div class="space-y-6">
				<div class="flex justify-center text-5xl text-white/80">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-24 w-24 transform transition-transform duration-300 hover:scale-110"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
						/>
					</svg>
				</div>
				<div class="space-y-4">
					<p class="text-xl font-medium text-white">Drop your ZIP file here</p>
					<p class="text-sm text-white/80">or</p>
					<button
						class="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none"
						onclick={() => fileInput!.click()}
					>
						Select File
					</button>
				</div>

				<p class="text-sm text-white/70">Only ZIP files are accepted ✨</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		width: min(90%, 500px);
	}
</style>
