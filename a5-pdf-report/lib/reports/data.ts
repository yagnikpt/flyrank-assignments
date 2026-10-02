import { getDb } from "./db.ts";

export type TopProduct = { product: string; orders: number; revenue: number };
export type DailyOrders = { day: string; orders: number };
export type OrderRow = {
	id: number;
	customer: string;
	product: string;
	amount: number;
	created_at: string;
};

export type ReportData = {
	totals: { orders: number; revenue: number };
	topProducts: TopProduct[];
	ordersPerDay: DailyOrders[];
	orders: OrderRow[];
};

const round2 = (n: number) => Math.round(n * 100) / 100;

function lastNDays(n: number, today = new Date()): string[] {
	return Array.from({ length: n }, (_, i) => {
		const d = new Date(today);
		d.setUTCDate(d.getUTCDate() - (n - 1 - i));
		return d.toISOString().slice(0, 10);
	});
}

export function getReportData(): ReportData {
	const db = getDb();

	const totals = db
		.prepare(
			"SELECT COUNT(*) AS orders, COALESCE(SUM(amount), 0) AS revenue FROM orders",
		)
		.get() as { orders: number; revenue: number };

	const topProducts = db
		.prepare(
			`SELECT product, COUNT(*) AS orders, SUM(amount) AS revenue
			 FROM orders
			 GROUP BY product
			 ORDER BY revenue DESC
			 LIMIT 5`,
		)
		.all() as TopProduct[];

	const days = lastNDays(7);
	const perDayRows = db
		.prepare(
			`SELECT created_at AS day, COUNT(*) AS orders
			 FROM orders
			 WHERE created_at >= ?
			 GROUP BY created_at`,
		)
		.all(days[0]) as DailyOrders[];
	const perDay = new Map(perDayRows.map((r) => [r.day, r.orders]));

	const orders = db
		.prepare(
			"SELECT id, customer, product, amount, created_at FROM orders ORDER BY created_at DESC, id DESC",
		)
		.all() as OrderRow[];

	return {
		totals: { orders: totals.orders, revenue: round2(totals.revenue) },
		topProducts: topProducts.map((p) => ({
			...p,
			revenue: round2(p.revenue),
		})),
		// Days with no orders still appear, as 0, so the table always has 7 rows.
		ordersPerDay: days.map((day) => ({ day, orders: perDay.get(day) ?? 0 })),
		orders,
	};
}
