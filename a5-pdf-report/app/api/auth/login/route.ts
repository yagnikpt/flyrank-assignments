import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseApiClient } from "@/lib/supabase-api";

export async function POST(request: NextRequest) {
	const body = await request.json().catch(() => null);
	const email = typeof body?.email === "string" ? body.email.trim() : "";
	const password = typeof body?.password === "string" ? body.password : "";

	if (!email || !password) {
		return NextResponse.json(
			{ error: "Email and password are required" },
			{ status: 400 },
		);
	}

	const { data, error } =
		await createSupabaseApiClient().auth.signInWithPassword({
			email,
			password,
		});
	if (error || !data.session) {
		return NextResponse.json(
			{ error: "Invalid login credentials" },
			{ status: 401 },
		);
	}

	return NextResponse.json(
		{ user: data.user, access_token: data.session.access_token },
		{ status: 200 },
	);
}
