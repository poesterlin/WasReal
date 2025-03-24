export function assert(condition: unknown, message?: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

export function downloadBlobUrl(url: string, filename: string) {
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
}

export function getStartOfDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(date1?: Date, date2?: Date) {
	if (!date1 || !date2) {
		return false;
	}

	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

export function throttle<T extends (...args: any[]) => void>(fn: T, wait: number) {
	let lastCalled = 0;

	return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
		const now = Date.now();

		if (now - lastCalled >= wait) {
			fn.apply(this, args);
			lastCalled = now;
		}
	};
}
