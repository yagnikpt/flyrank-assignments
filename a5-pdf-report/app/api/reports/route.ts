import { type NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createReport, listReports } from "@/lib/reports/service";

export async function GET(request: NextRequest) {
	const auth = await requireUser(request);
	if (auth.response) return auth.response;

	return NextResponse.json(
		listReports(auth.user.id).map((report) => ({
			id: report.id,
			created_at: report.created_at,
			file: `/api/reports/${report.id}/file`,
		})),
	);
}

export async function POST(request: NextRequest) {
	const auth = await requireUser(request);
	if (auth.response) return auth.response;

	// The body is optional: `{ "force": true }` skips the "already generated today" check.
	const raw = await request.text();
	let body: unknown = {};
	if (raw.trim()) {
		try {
			body = JSON.parse(raw);
		} catch {
			return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
		}
	}
	const force = (body as { force?: unknown } | null)?.force;
	if (force !== undefined && typeof force !== "boolean") {
		return NextResponse.json(
			{ error: "force must be a boolean" },
			{ status: 400 },
		);
	}

	try {
		const { report, created } = await createReport(auth.user.id, {
			force: force === true,
		});
		return NextResponse.json(
			{ id: report.id, file: `/api/reports/${report.id}/file` },
			{ status: created ? 201 : 200 },
		);
	} catch (error) {
		console.error("Report generation failed", error);
		return NextResponse.json(
			{ error: "Unable to generate report" },
			{ status: 500 },
		);
	}
}
