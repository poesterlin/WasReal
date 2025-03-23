import { assert } from '$lib/util';
import { wrap } from 'comlink';
import type { ProcessWorker as PW } from './process-worker';
import WorkerProcess from './process-worker?worker&inline';

let instance: PW | null = null;

export function getWorkerInstance(): PW {
	if (instance) {
		return instance;
	}

	const worker = new WorkerProcess({ name: 'process-worker' });
	instance = wrap<PW>(worker);
	assert(instance);

	return instance;
}
