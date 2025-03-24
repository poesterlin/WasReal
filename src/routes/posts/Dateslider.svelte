<script lang="ts">
	import { assert, throttle } from '$lib/util';

	let {
		dates,
		currentDate,
		setDate,
		isScrolling
	}: {
		dates: Date[];
		currentDate: Date;
		setDate: (date: Date) => void;
		isScrolling: boolean;
	} = $props();

	let sliderContainer = $state<HTMLDivElement>();
	let throttledScroll = throttle(scrollTo, 300);

	$effect(() => {
		if (isScrolling) {
			return;
		}

		const month = currentDate.getMonth();
		const year = currentDate.getFullYear();
		throttledScroll(year, month);
	});

	// Group dates by year and month. Each group holds an array of dates.
	let groupedDates = $derived(groupDates(dates));

	function groupDates(dates: Date[]) {
		const group: Record<string, number[] | undefined> = {};
		dates.forEach((d: Date) => {
			const dateObj = new Date(d);
			const year = dateObj.getFullYear();
			const month = dateObj.getMonth();

			if (!group[year]) {
				group[year] = [];
			}

			group[year].push(month);
		});

		// sort all months in ascending order
		for (const year in group) {
			group[year] = Array.from(new Set(group[year]))?.sort((a, b) => a - b);
		}

		return group;
	}

	function setCurrentDate(year: string, month: number) {
		const date = new Date(parseInt(year, 10), month);
		scrollTo(year, month);
		currentDate = date;
		setDate(date);
	}

	function scrollTo(year: string | number, month: number) {
		assert(sliderContainer);

		const button = sliderContainer.querySelector(
			`button[aria-label="${year} ${new Date(0, month).toLocaleString(undefined, {
				month: 'long'
			})}"]`
		) as HTMLButtonElement;

		if (!button) {
			console.error('Button not found');
			return;
		}

		sliderContainer.scrollTo({
			top: button.offsetTop - sliderContainer.offsetTop - 52,
			behavior: 'smooth'
		});
	}

	function isDateInMonth(date: Date, year: string, month: number) {
		return date.getMonth() === month && date.getFullYear() === parseInt(year, 10);
	}
</script>

<div
	bind:this={sliderContainer}
	class="scrollbar-thin scrollbar-thumb-pink-300 hidden w-min flex-col gap-2 overflow-y-auto pr-2 pb-4 select-none md:flex"
>
	{#each Object.keys(groupedDates).sort((a, b) => a.localeCompare(b)) as year}
		<!-- Year Label -->
		<div
			class="sticky top-0 z-10 rounded-l-lg rounded-b-lg bg-pink-50 p-2 text-xl font-bold text-pink-700 drop-shadow-sm"
		>
			{year}
		</div>

		{@const months = groupedDates[year]}
		{#if months}
			{#each months as month}
				{@const monthName = new Date(0, month).toLocaleString(undefined, { month: 'long' })}
				<!-- Month Button -->
				<button
					class:active-month={!isScrolling && isDateInMonth(currentDate, year, month)}
					class="mx-2 rounded-lg bg-pink-50/30 px-4 py-2 text-lg font-medium text-black shadow transition-all duration-200 ease-in-out hover:bg-pink-100/50"
					aria-label="{year} {monthName}"
					onclick={() => setCurrentDate(year, month)}
				>
					{monthName}
				</button>
			{/each}
		{/if}
	{/each}
</div>

<style>
	/* Custom style for the active month button */
	.active-month {
		background-color: var(--color-pink-50) !important;
	}

	/* Optional: custom scrollbar for a cute touch */
	::-webkit-scrollbar {
		width: 6px;
	}
	::-webkit-scrollbar-track {
		background: rgba(245, 208, 215, 0.4); /* soft pink track */
	}
	::-webkit-scrollbar-thumb {
		background-color: rgba(244, 114, 182, 0.6); /* vibrant pink thumb */
		border-radius: 3px;
	}
</style>
