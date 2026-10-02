import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { chromium } from "playwright";
import type { ReportData } from "./data.ts";

const escapeHtml = (value: string | number) =>
	String(value).replace(
		/[&<>"']/g,
		(c) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			})[c] as string,
	);

const money = (n: number) =>
	`$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function buildReportHtml(data: ReportData, now = new Date()): string {
	const date = now.toISOString().slice(0, 10);

	const topRows = data.topProducts
		.map(
			(p) =>
				`<tr><td>${escapeHtml(p.product)}</td><td class="num">${p.orders}</td><td class="num">${money(p.revenue)}</td></tr>`,
		)
		.join("");

	const dayRows = data.ordersPerDay
		.map(
			(d) =>
				`<tr><td>${escapeHtml(d.day)}</td><td class="num">${d.orders}</td></tr>`,
		)
		.join("");

	const orderRows = data.orders
		.map(
			(o) =>
				`<tr><td class="num">${o.id}</td><td>${escapeHtml(o.created_at)}</td><td>${escapeHtml(o.customer)}</td><td>${escapeHtml(o.product)}</td><td class="num">${money(o.amount)}</td></tr>`,
		)
		.join("");

	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Sales report ${date}</title>
<style>
	@page { margin: 18mm 14mm; }
	* { box-sizing: border-box; }
	body { font-family: Helvetica, Arial, sans-serif; color: #1a1a1a; font-size: 11pt; }
	h1 { margin: 0 0 4px; font-size: 22pt; }
	h2 { margin: 28px 0 8px; font-size: 14pt; }
	.subtitle { color: #666; margin: 0 0 20px; }
	.totals { display: flex; gap: 16px; }
	.card { flex: 1; padding: 14px 16px; border-radius: 8px; background: #eef2ff; border: 1px solid #c7d2fe; }
	.card .label { color: #4338ca; font-size: 9pt; text-transform: uppercase; letter-spacing: .05em; }
	.card .value { font-size: 20pt; font-weight: 700; margin-top: 4px; }
	table { width: 100%; border-collapse: collapse; font-size: 10pt; }
	th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
	th { background: #4338ca; color: #fff; font-weight: 600; }
	.num { text-align: right; font-variant-numeric: tabular-nums; }
	/* Print rules: never slice a row across pages, repeat the header on each page. */
	thead { display: table-header-group; }
	tr { break-inside: avoid; }
	h2 { break-after: avoid; }
	.all-orders { break-before: page; }
</style>
</head>
<body>
	<h1>Sales report</h1>
	<p class="subtitle">Generated ${date}</p>

	<div class="totals">
		<div class="card"><div class="label">Total orders</div><div class="value">${data.totals.orders}</div></div>
		<div class="card"><div class="label">Total revenue</div><div class="value">${money(data.totals.revenue)}</div></div>
	</div>

	<h2>Top 5 products by revenue</h2>
	<table>
		<thead><tr><th>Product</th><th class="num">Orders</th><th class="num">Revenue</th></tr></thead>
		<tbody>${topRows}</tbody>
	</table>

	<h2>Orders per day (last 7 days)</h2>
	<table>
		<thead><tr><th>Day</th><th class="num">Orders</th></tr></thead>
		<tbody>${dayRows}</tbody>
	</table>

	<section class="all-orders">
		<h2>All orders (${data.orders.length})</h2>
		<table>
			<thead><tr><th class="num">#</th><th>Date</th><th>Customer</th><th>Product</th><th class="num">Amount</th></tr></thead>
			<tbody>${orderRows}</tbody>
		</table>
	</section>
</body>
</html>`;
}

export async function renderPdf(html: string, path: string): Promise<void> {
	await mkdir(dirname(path), { recursive: true });
	const browser = await chromium.launch();
	try {
		const page = await browser.newPage();
		await page.setContent(html, { waitUntil: "load" });
		await page.pdf({
			path,
			format: "A4",
			printBackground: true,
			preferCSSPageSize: true,
		});
	} finally {
		await browser.close();
	}
}
