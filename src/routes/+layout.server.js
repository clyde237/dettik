import { buildClerkProps } from 'svelte-clerk/server';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
  const { userId } = locals.auth();

  return {
    userId,
    ...buildClerkProps(locals.auth())
  };
}
