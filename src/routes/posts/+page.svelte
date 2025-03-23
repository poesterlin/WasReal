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

	onMount(async () => {
		const worker = getWorkerInstance();
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
			const { filesFused } = await worker.getProgress();
			progress = Math.min(Math.floor((filesFused / posts.length) * 100), 100);
		}
	}
</script>

<button
	onclick={processAllPosts}
	class="glass-effect fixed right-4 bottom-4 z-50 rounded-lg text-white shadow-lg"
>
	<div class="flex items-center gap-2 rounded-lg bg-pink-400/30 p-2 pr-3">
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
	<div>
		<Progress {progress} />
		<h2>Processing Images</h2>
		<p>Please wait...</p>
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
