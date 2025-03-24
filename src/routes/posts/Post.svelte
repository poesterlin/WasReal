<script lang="ts">
	import type { Post } from '$lib/bereal';
	import { getWorkerInstance } from '$lib/worker/helper';
	import { onMount } from 'svelte';
	import { IconDownload, IconTransfer } from '@tabler/icons-svelte';
	import { assert, downloadBlobUrl } from '$lib/util';

	let {
		post,
		onVisible,
		isScrolling
	}: { post: Post; onVisible: () => void; isScrolling: boolean } = $props();
	let el = $state<HTMLElement>();
	let loadImage = $state(false);
	let primaryImg = $state('');
	let secondaryImg = $state('');
	let width = $state(0);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				width = entry.target.clientWidth;

				const visible = entry.intersectionRatio;
				if (visible >= 0.7) {
					onVisible();
				}

				if (isScrolling) {
					return;
				}

				if (entry.isIntersecting) {
					loadImage = true;
					getImages();
				}
			},
			{ threshold: [0, 0.7] }
		);

		assert(el);
		observer.observe(el);
	});

	async function getImages() {
		if (!loadImage || primaryImg || secondaryImg) {
			return;
		}

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

<div bind:this={el} class="relative w-full" style:height="{(width * 4) / 3}px">
	<div class="absolute top-3 right-3 flex items-center space-x-2 text-white">
		<button onclick={download} class="rounded border border-white bg-pink-200/50 px-2 py-1">
			<IconDownload></IconDownload>
		</button>

		<button onclick={swap} class="rounded border border-white bg-pink-200/50 px-2 py-1">
			<IconTransfer />
		</button>
	</div>

	<img src={primaryImg} alt={post.caption} class="h-auto w-full rounded object-cover" />
	<img
		class="absolute top-3 left-3 h-auto w-[30%] rounded border border-white shadow"
		src={secondaryImg}
		alt={post.caption}
	/>

	<!-- <div class="absolute right-3 bottom-3 text-white">
		{new Date(post.takenAt).toLocaleDateString()}
	</div> -->
</div>
