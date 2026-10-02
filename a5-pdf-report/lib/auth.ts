import type { User } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseApiClient } from "./supabase-api";

type AuthResult =
	| { user: User; token: string; response?: never }
	| { user?: never; token?: never; response: NextResponse };

function accessTokenFrom(request: NextRequest): string | null {
	const authorization = request.headers.get("authorization");
	if (!authorization?.startsWith("Bearer ")) return null;

	const token = authorization.slice("Bearer ".length).trim();
	return token || null;
}

async function requireUser(request: NextRequest): Promise<AuthResult> {
	const token = accessTokenFrom(request);
	if (!token) {
		return {
			response: NextResponse.json(
				{ error: "Access token required" },
				{ status: 401 },
			),
		};
	}

	const supabase = createSupabaseApiClient(token);
	const { data, error } = await supabase.auth.getUser(token);
	if (error || !data.user) {
		return {
			response: NextResponse.json(
				{ error: "Invalid or expired token" },
				{ status: 401 },
			),
		};
	}

	return { user: data.user, token };
}

export { requireUser };
