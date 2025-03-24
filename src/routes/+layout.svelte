<script lang="ts">
	import { toastStore } from '$lib/toast.svelte';
	import { slide } from 'svelte/transition';
	import { onNavigate } from '$app/navigation';
	import '../app.css';

	const title = 'WasReal - Edit and Export Your BeReal Data';
	const description =
		'WasReal is a tool that allows you to explore, edit, and export your personal BeReal data. Create a personal archive of your BeReal memories easily and securely.';

	let { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) {
			return;
		}

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>WasReal</title>
	<meta name="title" content={title} />
	<meta name="description" content={description} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://was-real.netlify.app/" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://was-real.netlify.app/" />
	<meta property="twitter:title" content={title} />
	<meta property="twitter:description" content={description} />
</svelte:head>

<main class="font-sans leading-relaxed">
	{@render children()}

	{#each toastStore.toasts as toast, i (toast.id)}
		<div
			class="fixed right-4 bottom-4 z-50"
			in:slide={{ duration: 300 }}
			out:slide={{ duration: 300 }}
			style="translate: 0 {i * -4}rem;"
		>
			<div
				class="animate-slide-in rounded-xl border-l-4 border-rose-400 bg-pink-50 p-4 text-gray-700 shadow-lg"
				style="min-width: 300px"
			>
				<p class="text-sm font-semibold">{toast.message}</p>
			</div>
		</div>
	{/each}
</main>

<nav>
	<ul class="mt-8 flex justify-center space-x-4">
		<li>
			<a href="/privacy" class="text-gray-600 hover:text-gray-800"> Privacy </a>
		</li>
	</ul>
</nav>
