<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Post } from '$lib/bereal';
	import { assert, downloadBlobUrl, getStartOfDay, isSameDay } from '$lib/util';
	import { getWorkerInstance } from '$lib/worker/helper';
	import { IconDownload } from '@tabler/icons-svelte';
	import { onMount } from 'svelte';
	import Dateslider from './Dateslider.svelte';
	import Cell from './Post.svelte';

	let posts: Post[] = $state([]);
	let dialog = $state<HTMLDialogElement>();
	let container = $state<HTMLDivElement>();
	let open = $state(false);
	let progress = $state(0);
	let formattedEta = $state('');
	let isScrolling = $state(false);

	// Get unique sorted dates from images
	let dates = $derived(
		[...new Set(posts.map((post) => getStartOfDay(new Date(post.takenAt))))].sort()
	);
	let currentDate = $state(new Date());

	onMount(async () => {
		const worker = getWorkerInstance();
		await worker.init();
		posts = await worker.getPosts();

		if (posts.length === 0) {
			return goto('/');
		}

		// scroll to top
		window.scrollTo(0, 0);
	});

	function getMore(post: Post) {
		currentDate = new Date(post.takenAt);
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

	function scrollGridTo(date: Date) {
		const index = posts.findIndex((d) => isSameDay(new Date(d.takenAt), date));
		const scrollPercentage = index / posts.length;
		assert(container);
		container.scrollTo({
			top: scrollPercentage * (container.scrollHeight - container.clientHeight),
			behavior: 'smooth'
		});
		isScrolling = true;
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

<h1 class="font-display glass-effect mb-6 cursor-default py-8 pl-6 text-6xl font-bold md:text-5xl">
	<span class="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
		<span class="hidden md:inline">✨</span> BeReal Memories
		<span class="hidden md:inline">✨</span>
	</span>
</h1>

<div class="flex h-screen gap-4 md:h-[calc(100vh-11rem-30px)]">
	<!-- Image Grid -->
	<div
		onscrollend={() => (isScrolling = false)}
		bind:this={container}
		class="grid flex-1 grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-4 p-4 md:overflow-y-auto"
	>
		{#each posts as post (post.primary.path)}
			<Cell {post} onVisible={() => getMore(post)} {isScrolling} />
		{/each}
	</div>

	<!-- Date Slider -->
	<Dateslider {dates} {currentDate} setDate={(d) => scrollGridTo(d)} {isScrolling} />
</div>

<dialog
	bind:this={dialog}
	class="glass-effect relative overflow-hidden rounded-xl p-6"
	open={false}
	class:open
>
	<div
		class="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-pink-200/40 to-purple-200/40 transition-all duration-300"
		style="width: {progress}%"
	></div>

	<div class="flex flex-col items-center gap-4 text-gray-800">
		<div class="animate-bounce">
			<span class="text-2xl">🌟</span>
		</div>

		<h2 class="font-display relative text-xl">
			<span class="relative">
				Processing your memories...
				<span
					class="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-pink-400 to-purple-400"
				></span>
			</span>
		</h2>

		<p class="text-black-600 flex items-center gap-2 text-sm font-semibold">
			{formattedEta} remaining
		</p>
	</div>
</dialog>

<style>
	@keyframes shimmer {
		0% {
			background-position: -200% center;
		}
		100% {
			background-position: 200% center;
		}
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
		background: rgba(0, 0, 0, 0.219);
		backdrop-filter: blur(2px);
	}

	dialog.open {
		display: flex;
	}
</style>
