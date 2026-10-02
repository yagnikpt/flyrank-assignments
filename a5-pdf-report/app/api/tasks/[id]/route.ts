import { type NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseApiClient } from "@/lib/supabase-api";

type RouteContext = { params: Promise<{ id: string }> };

function taskId(value: string): number | null {
	const id = Number(value);
	return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function GET(request: NextRequest, context: RouteContext) {
	const auth = await requireUser(request);
	if (auth.response) return auth.response;
	const id = taskId((await context.params).id);
	if (!id)
		return NextResponse.json({ error: "Task not found" }, { status: 404 });

	const { data, error } = await createSupabaseApiClient(auth.token)
		.from("tasks")
		.select("id, title, done, created_at, updated_at")
		.eq("id", id)
		.maybeSingle();
	if (error) {
		console.error("GET /api/tasks/:id failed:", error);
		return NextResponse.json({ error: "Unable to load task" }, { status: 500 });
	}
	if (!data)
		return NextResponse.json({ error: "Task not found" }, { status: 404 });
	return NextResponse.json(data);
}

export async function PUT(request: NextRequest, context: RouteContext) {
	const auth = await requireUser(request);
	if (auth.response) return auth.response;
	const id = taskId((await context.params).id);
	if (!id)
		return NextResponse.json({ error: "Task not found" }, { status: 404 });

	const body = await request.json().catch(() => null);
	const changes: { title?: string; done?: boolean; updated_at: string } = {
		updated_at: new Date().toISOString(),
	};
	if (typeof body?.title === "string") {
		const title = body.title.trim();
		if (!title)
			return NextResponse.json(
				{ error: "title cannot be empty" },
				{ status: 400 },
			);
		changes.title = title;
	}
	if (body && Object.hasOwn(body, "done")) {
		if (typeof body.done !== "boolean") {
			return NextResponse.json(
				{ error: "done must be a boolean" },
				{ status: 400 },
			);
		}
		changes.done = body.done;
	}
	if (changes.title === undefined && changes.done === undefined) {
		return NextResponse.json(
			{ error: "request body must include title and/or done" },
			{ status: 400 },
		);
	}

	const { data, error } = await createSupabaseApiClient(auth.token)
		.from("tasks")
		.update(changes)
		.eq("id", id)
		.select("id, title, done, created_at, updated_at")
		.maybeSingle();
	if (error) {
		console.error("PUT /api/tasks/:id failed:", error);
		return NextResponse.json(
			{ error: "Unable to update task" },
			{ status: 500 },
		);
	}
	if (!data)
		return NextResponse.json({ error: "Task not found" }, { status: 404 });
	return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
	const auth = await requireUser(request);
	if (auth.response) return auth.response;
	const id = taskId((await context.params).id);
	if (!id)
		return NextResponse.json({ error: "Task not found" }, { status: 404 });

	const { data, error } = await createSupabaseApiClient(auth.token)
		.from("tasks")
		.delete()
		.eq("id", id)
		.select("id")
		.maybeSingle();
	if (error) {
		console.error("DELETE /api/tasks/:id failed:", error);
		return NextResponse.json(
			{ error: "Unable to delete task" },
			{ status: 500 },
		);
	}
	if (!data)
		return NextResponse.json({ error: "Task not found" }, { status: 404 });
	return new NextResponse(null, { status: 204 });
}
