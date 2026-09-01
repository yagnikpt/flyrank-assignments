import { type NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseApiClient } from "@/lib/supabase-api";

export async function POST(request: NextRequest) {
	const auth = await requireUser(request);
	if (auth.response) return auth.response;

	const { error } = await createSupabaseApiClient(auth.token).auth.signOut();
	if (error) {
		return NextResponse.json({ error: "Unable to log out" }, { status: 500 });
	}

	return new NextResponse(null, { status: 204 });
}
