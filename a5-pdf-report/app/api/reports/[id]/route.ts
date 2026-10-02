import { type NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getReport } from "@/lib/reports/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
	const auth = await requireUser(request);
	if (auth.response) return auth.response;

	const { id } = await context.params;
	const report = getReport(id, auth.user.id);
	if (!report)
		return NextResponse.json({ error: "Report not found" }, { status: 404 });

	return NextResponse.json({
		id: report.id,
		created_at: report.created_at,
		file: `/api/reports/${report.id}/file`,
	});
}
