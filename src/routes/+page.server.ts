import { validateAuth, validateForm } from 'lib/server/util';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const locals = validateAuth(event);

	return {};
};

export const actions: Actions = {
	//	default: validateForm(z.object({}), async (event, form) => {
	//		const locals = validateAuth(event);
	//	})
};
