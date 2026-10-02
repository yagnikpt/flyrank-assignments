import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";

// Point the app at a throwaway database and reports directory before first use.
const dir = mkdtempSync(join(tmpdir(), "a5-report-"));
process.env.REPORT_DB_PATH = join(dir, "test.db");
process.env.REPORTS_DIR = join(dir, "reports");

const { seed } = await import("./seed.ts");
const { getReportData } = await import("../lib/reports/data.ts");
const { createReport, getReport, listReports, reportFilePath } = await import(
	"../lib/reports/service.ts"
);

const pdfFiles = () =>
	existsSync(process.env.REPORTS_DIR as string)
		? readdirSync(process.env.REPORTS_DIR as string).filter((f) =>
				f.endsWith(".pdf"),
			)
		: [];

before(() => {
	seed();
});

after(async () => {
	const { rm } = await import("node:fs/promises");
	await rm(dir, { recursive: true, force: true });
});

test("seed is safe to run twice", () => {
	assert.equal(seed(), 200);
	assert.equal(seed(), 200);
});

test("aggregates are consistent with each other", () => {
	const data = getReportData();
	assert.equal(data.totals.orders, 200);
	assert.equal(data.orders.length, 200);
	assert.equal(data.topProducts.length, 5);
	assert.equal(data.ordersPerDay.length, 7);

	const sum = data.orders.reduce((acc, o) => acc + o.amount, 0);
	assert.ok(Math.abs(sum - data.totals.revenue) < 0.01);
	for (const p of data.topProducts) {
		assert.ok(p.revenue <= data.totals.revenue);
	}
	const sorted = [...data.topProducts].sort((a, b) => b.revenue - a.revenue);
	assert.deepEqual(data.topProducts, sorted);
});

test("createReport writes a real PDF and returns the same report for repeat requests", async () => {
	const first = await createReport("user-a");
	assert.equal(first.created, true);
	assert.equal(pdfFiles().length, 1);
	assert.equal(
		readFileSync(reportFilePath(first.report)).subarray(0, 5).toString(),
		"%PDF-",
	);

	const second = await createReport("user-a");
	assert.equal(second.created, false);
	assert.equal(second.report.id, first.report.id);
	assert.equal(pdfFiles().length, 1);
});

test("concurrent requests from one user produce a single report", async () => {
	const [a, b] = await Promise.all([
		createReport("user-b"),
		createReport("user-b"),
	]);
	assert.equal(a.report.id, b.report.id);
	assert.equal([a.created, b.created].filter(Boolean).length, 1);
	assert.equal(pdfFiles().length, 2); // user-a's + user-b's
});

test("force: true generates a fresh report", async () => {
	const before = await createReport("user-a");
	const forced = await createReport("user-a", { force: true });
	assert.equal(forced.created, true);
	assert.notEqual(forced.report.id, before.report.id);
});

test("listReports returns only the owner's reports, newest first", async () => {
	const mine = listReports("user-a");
	assert.ok(mine.length >= 2);
	assert.ok(mine.every((r) => r.user_id === "user-a"));
	const times = mine.map((r) => r.created_at);
	assert.deepEqual(times, [...times].sort().reverse());
	assert.deepEqual(listReports("nobody"), []);
});

test("reports are only visible to their owner", async () => {
	const { report } = await createReport("user-a");
	assert.ok(getReport(report.id, "user-a"));
	assert.equal(getReport(report.id, "user-b"), null);
	assert.equal(getReport("../../etc/passwd", "user-a"), null);
});
