<script lang="ts">
	import { assert } from '$lib/util';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let title = 'Existing Data Found';
	let description =
		'We found some BeReal posts already stored. Would you like to continue working with it?';

	let dialogEl = $state<HTMLDialogElement>();

	let { onClear }: { onClear: () => void } = $props();

	// Show modal function
	onMount(() => {
		assert(dialogEl);
		dialogEl.showModal();
	});

	// Hide modal function
	function hideModal() {
		assert(dialogEl);
		dialogEl.close();
	}

	function handleClear() {
		hideModal();
		onClear();
	}

	// Close on escape key
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			hideModal();
		}
	}

	// Close on outside click
	function handleOutsideClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			hideModal();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<dialog
	id="data-modal"
	class="fixed inset-0 z-50"
	onclick={handleOutsideClick}
	bind:this={dialogEl}
	transition:fade={{
		delay: 0,
		duration: 300
	}}
>
	<div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"></div>

	<div class="fixed top-1/2 left-1/2 w-full max-w-xl -translate-x-1/2 -translate-y-1/2">
		<div class="mx-4 rounded-2xl bg-pink-200/70 p-8 shadow-xl">
			<div class="text-center">
				<!-- Icon -->
				<div
					class="bg-gradient-custom mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
				>
					<svg class="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				</div>

				<h3 class="mb-2 text-2xl font-bold text-gray-900">
					{title}
				</h3>

				<p class="mb-8 text-gray-600">
					{description}
				</p>

				<div class="flex flex-col justify-center gap-3 sm:flex-row">
					<button
						onclick={handleClear}
						class="w-full rounded-lg border-2 border-gray-900 bg-white px-6 py-3 font-semibold text-gray-900 transition-transform hover:-translate-y-0.5 sm:w-auto"
					>
						Clear & Start Fresh
					</button>
					<a
						href="/posts"
						class="w-full rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 sm:w-auto"
					>
						Continue with Existing Data
					</a>
				</div>
			</div>
		</div>
	</div>
</dialog>
