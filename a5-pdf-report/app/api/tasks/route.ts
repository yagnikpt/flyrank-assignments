import { type NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseApiClient } from "@/lib/supabase-api";

export async function GET(request: NextRequest) {
	const auth = await requireUser(request);
	if (auth.response) return auth.response;

	const { data, error } = await createSupabaseApiClient(auth.token)
		.from("tasks")
		.select("id, title, done, created_at, updated_at")
		.order("id");

	if (error) {
		console.error("GET /api/tasks failed:", error);
		return NextResponse.json(
			{ error: "Unable to load tasks" },
			{ status: 500 },
		);
	}
	return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
	const auth = await requireUser(request);
	if (auth.response) return auth.response;

	const body = await request.json().catch(() => null);
	const title = typeof body?.title === "string" ? body.title.trim() : "";
	if (!title) {
		return NextResponse.json(
			{ error: "title is required and cannot be empty" },
			{ status: 400 },
		);
	}

	const { data, error } = await createSupabaseApiClient(auth.token)
		.from("tasks")
		.insert({ user_id: auth.user.id, title, done: false })
		.select("id, title, done, created_at, updated_at")
		.single();

	if (error) {
		console.error("POST /api/tasks failed:", error);
		return NextResponse.json(
			{ error: "Unable to create task" },
			{ status: 500 },
		);
	}
	return NextResponse.json(data, { status: 201 });
}
