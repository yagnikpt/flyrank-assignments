import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { basename, join } from "node:path";
import { getReportData } from "./data.ts";
import { getDb, reportsDir } from "./db.ts";
import { buildReportHtml, renderPdf } from "./render.ts";

export type ReportRow = {
	id: string;
	user_id: string;
	path: string;
	created_at: string;
};

export type ReportResult = { report: ReportRow; created: boolean };

export const REPORT_ID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Concurrent requests from the same user (a double click) share one
// in-flight run instead of each launching a browser. Single-process only.
const inFlight = new Map<string, Promise<ReportRow>>();

export function getReport(id: string, userId: string): ReportRow | null {
	if (!REPORT_ID_PATTERN.test(id)) return null;
	const row = getDb()
		.prepare(
			"SELECT id, user_id, path, created_at FROM reports WHERE id = ? AND user_id = ?",
		)
		.get(id, userId) as ReportRow | undefined;
	return row ?? null;
}

export function listReports(userId: string, limit = 20): ReportRow[] {
	return getDb()
		.prepare(
			`SELECT id, user_id, path, created_at FROM reports
			 WHERE user_id = ?
			 ORDER BY created_at DESC LIMIT ?`,
		)
		.all(userId, limit) as ReportRow[];
}

/** Absolute path of the stored PDF. `basename` keeps it inside the reports dir. */
export function reportFilePath(report: ReportRow): string {
	return join(reportsDir(), basename(report.path));
}

function findToday(userId: string): ReportRow | null {
	const startOfToday = `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`;
	const row = getDb()
		.prepare(
			`SELECT id, user_id, path, created_at FROM reports
			 WHERE user_id = ? AND created_at >= ?
			 ORDER BY created_at DESC LIMIT 1`,
		)
		.get(userId, startOfToday) as ReportRow | undefined;
	return row ?? null;
}

async function generate(userId: string): Promise<ReportRow> {
	const id = randomUUID();
	const filename = `${id}.pdf`;
	const absolute = join(reportsDir(), filename);

	// query -> render -> store
	const data = getReportData();
	await renderPdf(buildReportHtml(data), absolute);

	const row: ReportRow = {
		id,
		user_id: userId,
		path: filename,
		created_at: new Date().toISOString(),
	};
	try {
		getDb()
			.prepare(
				"INSERT INTO reports (id, user_id, path, created_at) VALUES (?, ?, ?, ?)",
			)
			.run(row.id, row.user_id, row.path, row.created_at);
	} catch (error) {
		await rm(absolute, { force: true });
		throw error;
	}
	return row;
}

/**
 * Idempotent: if this user already has a report from today (UTC), return it
 * instead of generating another one, unless `force` is set.
 */
export async function createReport(
	userId: string,
	{ force = false }: { force?: boolean } = {},
): Promise<ReportResult> {
	if (!force) {
		const existing = findToday(userId);
		if (existing) return { report: existing, created: false };

		const running = inFlight.get(userId);
		if (running) return { report: await running, created: false };
	}

	const run = generate(userId);
	if (!force) inFlight.set(userId, run);
	try {
		return { report: await run, created: true };
	} finally {
		if (inFlight.get(userId) === run) inFlight.delete(userId);
	}
}
