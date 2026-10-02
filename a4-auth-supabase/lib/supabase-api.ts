import { createClient } from "@supabase/supabase-js";

function createSupabaseApiClient(accessToken?: string) {
	const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key =
		process.env.SUPABASE_KEY ??
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

	if (!url || !key) {
		throw new Error("SUPABASE_URL and SUPABASE_KEY must be configured");
	}

	return createClient(url, key, {
		auth: { autoRefreshToken: false, persistSession: false },
		global: accessToken
			? { headers: { Authorization: `Bearer ${accessToken}` } }
			: undefined,
	});
}

export { createSupabaseApiClient };
