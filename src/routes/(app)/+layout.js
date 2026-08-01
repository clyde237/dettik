import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutLoad} */
export async function load({ parent }) {
  const { userId } = await parent();

  if (!userId) {
    throw redirect(303, '/login');
  }

  return { userId };
}
