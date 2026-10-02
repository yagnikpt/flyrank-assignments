import { getDb } from "../lib/reports/db.ts";

const ORDER_COUNT = 200;
const DAYS = 30;
const PRODUCTS = [
	"Espresso Beans 1kg",
	"Ceramic Mug",
	"Pour-Over Kit",
	"Milk Frother",
	"Cold Brew Bottle",
	"Gift Card",
];
const CUSTOMERS = [
	"Ada Lovelace",
	"Grace Hopper",
	"Alan Turing",
	"Linus Torvalds",
	"Margaret Hamilton",
	"Dennis Ritchie",
	"Barbara Liskov",
	"Ken Thompson",
	"Radia Perlman",
	"Guido van Rossum",
];

const pick = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

function randomDate() {
	const d = new Date();
	d.setUTCDate(d.getUTCDate() - Math.floor(Math.random() * DAYS));
	return d.toISOString().slice(0, 10);
}

export function seed() {
	const db = getDb();
	const insert = db.prepare(
		"INSERT INTO orders (customer, product, amount, created_at) VALUES (?, ?, ?, ?)",
	);

	db.exec("BEGIN");
	try {
		// Start clean so running the seed twice still leaves exactly ORDER_COUNT rows.
		db.exec("DELETE FROM orders");
		db.exec("DELETE FROM sqlite_sequence WHERE name = 'orders'");
		for (let i = 0; i < ORDER_COUNT; i++) {
			const amount = Math.round((5 + Math.random() * 195) * 100) / 100;
			insert.run(pick(CUSTOMERS), pick(PRODUCTS), amount, randomDate());
		}
		db.exec("COMMIT");
	} catch (error) {
		db.exec("ROLLBACK");
		throw error;
	}

	const { count } = db
		.prepare("SELECT COUNT(*) AS count FROM orders")
		.get() as {
		count: number;
	};
	return count;
}

if (import.meta.main) {
	console.log(`Seeded report.db: ${seed()} orders`);
}
