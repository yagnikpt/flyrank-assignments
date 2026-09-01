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

	const { data, error } = await createSupabaseApiClient().auth.signUp({
		email,
		password,
	});
	if (error)
		return NextResponse.json({ error: error.message }, { status: 400 });

	return NextResponse.json({ user: data.user }, { status: 201 });
}
