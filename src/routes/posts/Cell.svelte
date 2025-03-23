<script lang="ts">
	import type { Post } from '$lib/bereal';
	import { getWorkerInstance } from '$lib/worker/helper';
	import { onMount } from 'svelte';
	import { IconDownload, IconTransfer } from '@tabler/icons-svelte';
	import { downloadBlobUrl } from '$lib/util';

	let { post, onVisible }: { post: Post; onVisible: () => void } = $props();
	let el: HTMLElement | undefined = $state();
	let primaryImg = $state('');
	let secondaryImg = $state('');

	onMount(() => {
		const observer = new IntersectionObserver((entries) => {
			const entry = entries[0];
			if (entry.isIntersecting) {
				onVisible();
				getImage();
			}
		});

		observer.observe(el!);
	});

	async function getImage() {
		const worker = getWorkerInstance();
		const images = await worker.getImages($state.snapshot(post));
		primaryImg = images[0];
		secondaryImg = images[1];
	}

	function swap() {
		[primaryImg, secondaryImg] = [secondaryImg, primaryImg];
	}

	async function download() {
		const worker = getWorkerInstance();
		const combined = (await worker.fuseImages(primaryImg, secondaryImg)) as string;
		const date = new Date(post.takenAt);
		const dateString = date.toISOString().split('T')[0];
		const download = `${dateString}-${post.caption ?? 'bereal'}.jpg`;
		downloadBlobUrl(combined, download);
	}
</script>

<div bind:this={el} class="relative max-h-[60svh] min-h-[30svh] w-full">
	<div class="absolute top-3 right-3 flex items-center space-x-2 text-white">
		<button onclick={download} class="rounded border border-white bg-pink-200/50 px-2 py-1">
			<IconDownload></IconDownload>
		</button>

		<button onclick={swap} class="rounded border border-white bg-pink-200/50 px-2 py-1">
			<IconTransfer />
		</button>
	</div>

	<img src={primaryImg} alt={post.caption} class="h-full w-full object-cover" />
	<img
		class="absolute top-3 left-3 h-auto w-[30%] rounded border border-white shadow"
		src={secondaryImg}
		alt={post.caption}
	/>
</div>
