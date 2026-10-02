import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { type NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getReport, reportFilePath } from "@/lib/reports/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
	const auth = await requireUser(request);
	if (auth.response) return auth.response;

	const { id } = await context.params;
	const report = getReport(id, auth.user.id);
	if (!report)
		return NextResponse.json({ error: "Report not found" }, { status: 404 });

	// Store and link: the database only holds the file's name; the bytes stay on disk.
	const path = reportFilePath(report);
	const size = await stat(path)
		.then((s) => s.size)
		.catch(() => null);
	if (size === null)
		return NextResponse.json(
			{ error: "Report file not found" },
			{ status: 404 },
		);

	return new NextResponse(
		Readable.toWeb(createReadStream(path)) as ReadableStream,
		{
			headers: {
				"Content-Type": "application/pdf",
				"Content-Length": String(size),
				"Content-Disposition": `attachment; filename="report-${report.id}.pdf"`,
			},
		},
	);
}
