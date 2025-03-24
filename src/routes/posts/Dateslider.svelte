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
		currentDate = date;
		setDate(date);
		scrollTo(year, month);
	}

	function scrollTo(year: string | number, month: number) {
		assert(sliderContainer);

		const yearLabel = sliderContainer.querySelector(
			`button[aria-label="${year} ${new Date(0, month).toLocaleString(undefined, {
				month: 'long'
			})}"]`
		) as HTMLButtonElement;

		if (!yearLabel) {
			console.log('Year label not found');
			return;
		}

		sliderContainer.scrollTo({
			top: yearLabel.offsetTop - sliderContainer.offsetTop - 52,
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
			class="sticky top-0 z-10 rounded-b-lg border-b border-pink-300 bg-white/20 p-2 text-xl font-bold text-pink-600 drop-shadow-lg backdrop-blur-lg"
		>
			{year}
		</div>

		{@const months = groupedDates[year]}
		{#if months}
			{#each months as month}
				{@const monthName = new Date(0, month).toLocaleString(undefined, { month: 'long' })}
				<!-- Month Button (with number of entries) -->
				<button
					class:highlight={!isScrolling && isDateInMonth(currentDate, year, month)}
					class="rounded-lg bg-white/20 p-2 p-2 pr-5 pl-4 text-lg font-medium text-gray-800 shadow-md backdrop-blur-lg transition-all duration-200 ease-in-out hover:bg-pink-100"
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
	/* Additional custom style for the highlighted button */
	.highlight {
		background-color: #f472b6;
		color: white;
		box-shadow: 0 0 0 2px #f472b6;
	}

	/* Optional: custom scrollbar for a cute touch */
	/* You can remove or adjust these as needed */
	::-webkit-scrollbar {
		width: 6px;
	}
	::-webkit-scrollbar-track {
		background: rgba(255, 192, 203, 0.2); /* light pink track */
	}
	::-webkit-scrollbar-thumb {
		background-color: rgba(255, 105, 180, 0.6); /* hot pink thumb */
		border-radius: 3px;
	}
</style>
