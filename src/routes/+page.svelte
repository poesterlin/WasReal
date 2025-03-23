<script lang="ts">
	import { getWorkerInstance } from '$lib/worker/helper';
	import { onMount } from 'svelte';
	import DataFoundModal from './data-found-modal.svelte';

	let showModal = $state(false);

	onMount(async () => {
		const worker = getWorkerInstance();
		await worker.init();
		const posts = await worker.getPosts();
		if (posts.length > 0) {
			showModal = true;
		}
	});

	function onClear() {
		showModal = false;
		const worker = getWorkerInstance();
		worker.clearData();
	}
</script>

<div class="glass-effect bg-white/10 px-8 py-16 text-center">
	<h1
		class="m-0 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-6xl font-bold text-transparent md:text-5xl"
	>
		WasReal
	</h1>
	<p class="mt-4 mb-4 text-2xl text-gray-800 md:text-xl">Edit and export your BeReal data dumps!</p>
	<div class="mx-auto mt-8 flex max-w-2xl justify-center gap-4 md:flex-col md:items-stretch">
		<a
			href="/instructions"
			class="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white no-underline transition-transform hover:-translate-y-0.5"
		>
			Get Started
		</a>
		<a
			href="https://github.com/poesterlin/wasreal"
			class="rounded-lg border-2 border-gray-900 bg-white/20 px-6 py-3 font-semibold text-gray-900 no-underline transition-transform hover:-translate-y-0.5"
		>
			View on GitHub
		</a>
	</div>
</div>
<section id="getting-started" class="mx-auto max-w-7xl px-8 py-16">
	<h2 class="mb-8 text-center text-3xl font-bold text-gray-900">Getting Started</h2>
	<div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
		<div class="glass-effect rounded-xl bg-white/20 p-8">
			<h3 class="mb-4 text-xl font-semibold">1. Request Your Data</h3>
			<p>
				Request your BeReal data dump through the app settings. We'll guide you through the process.
			</p>
		</div>
		<div class="glass-effect rounded-xl bg-white/20 p-8">
			<h3 class="mb-4 text-xl font-semibold">2. Upload Your Data</h3>
			<p>Once you receive your data, simply upload the zip file to WasReal.</p>
		</div>
		<div class="glass-effect rounded-xl bg-white/20 p-8">
			<h3 class="mb-4 text-xl font-semibold">3. Export &amp; Share</h3>
			<p>Edit, organize, and export your BeReal memories in various formats.</p>
		</div>
	</div>
</section>
<section id="features" class="mx-auto max-w-7xl px-8 py-16">
	<h2 class="mb-8 text-center text-3xl font-bold text-gray-900">Features</h2>
	<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
		<div class="glass-effect rounded-xl bg-white/20 p-8">
			<h3 class="mb-4 text-xl font-semibold">Data Exploration</h3>
			<p>Easily browse through your BeReal posts with our intuitive interface.</p>
		</div>
		<div class="glass-effect rounded-xl bg-white/20 p-8">
			<h3 class="mb-4 text-xl font-semibold">Data Export</h3>
			<p>Download your data all at once or in parts in various formats.</p>
		</div>
		<div class="glass-effect rounded-xl bg-white/20 p-8">
			<h3 class="mb-4 text-xl font-semibold">Privacy First</h3>
			<p>Your data never leaves your device. Everything happens in your browser.</p>
		</div>
	</div>
</section>

{#if showModal}
	<DataFoundModal {onClear}></DataFoundModal>
{/if}
