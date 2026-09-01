import { type NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
	const auth = await requireUser(request);
	if (auth.response) return auth.response;

	return NextResponse.json({
		id: auth.user.id,
		email: auth.user.email,
		created_at: auth.user.created_at,
	});
}
