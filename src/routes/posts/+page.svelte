<script lang="ts">
	import type { Post } from '$lib/bereal';
	import { getWorkerInstance } from '$lib/worker/helper';
	import { onMount } from 'svelte';
	import Cell from './Cell.svelte';
	import { assert, downloadBlobUrl } from '$lib/util';
	import { IconDownload } from '@tabler/icons-svelte';
	import Progress from './Progress.svelte';

	let posts: Post[] = $state([]);
	let num = $state(30);
	let dialog = $state<HTMLDialogElement>();
	let open = $state(false);
	let progress = $state(0);
	let formattedEta = $state('');

	onMount(async () => {
		const worker = getWorkerInstance();
		await worker.init();
		posts = await worker.getPosts();

		// scroll to top
		window.scrollTo(0, 0);
	});

	function getMore() {
		num += 1;
	}

	async function processAllPosts() {
		assert(dialog);
		dialog.showModal();
		open = true;

		const worker = getWorkerInstance();
		worker.processAllPosts().then((zip) => {
			downloadBlobUrl(zip, 'bereal.zip');

			assert(dialog);
			dialog.close();
			open = false;
		});

		while (open) {
			await new Promise((resolve) => setTimeout(resolve, 100));
			const { filesFused, averageTime } = await worker.getProgress();
			progress = Math.min(Math.floor((filesFused / posts.length) * 100), 100);
			const missing = posts.length - filesFused;
			const eta = missing * averageTime;
			formattedEta = formatEta(eta);
		}
	}

	function formatEta(eta: number) {
		const seconds = Math.floor(eta / 1000) % 60;
		const minutes = Math.floor(eta / (1000 * 60));

		return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
	}
</script>

<button
	onclick={processAllPosts}
	class="glass-effect fixed right-4 bottom-4 z-50 rounded-lg text-black shadow-lg"
>
	<div class="flex items-center gap-2 rounded-lg bg-pink-200/60 p-2 pr-5 pl-4">
		<IconDownload></IconDownload>

		Download All
	</div>
</button>

<!-- grid -->
<div class="grid">
	{#each posts.slice(0, num) as post (post.primary.path)}
		<Cell {post} onVisible={getMore} />
	{/each}
</div>

<dialog bind:this={dialog} class="glass-effect" open={false} class:open>
	<div class="flex flex-col items-center gap-4 text-black">
		<Progress {progress} />
		<h2 class="underline">Processing Images</h2>
		<p class="text-sm">ca. {formattedEta} left</p>
	</div>
</dialog>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}

	dialog {
		position: fixed;
		inset: 0;
		display: none;
		flex-direction: column;
		width: max-content;
		height: max-content;
		margin: auto;
		padding: 2rem;
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.6);
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.6);
	}

	dialog.open {
		display: flex;
	}
</style>
