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
