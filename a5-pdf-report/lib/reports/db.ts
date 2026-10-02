import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS orders (
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	customer   TEXT NOT NULL,
	product    TEXT NOT NULL,
	amount     REAL NOT NULL,
	created_at TEXT NOT NULL -- YYYY-MM-DD (UTC)
);

CREATE TABLE IF NOT EXISTS reports (
	id         TEXT PRIMARY KEY,
	user_id    TEXT NOT NULL,
	path       TEXT NOT NULL, -- file name inside the reports directory, e.g. <id>.pdf
	created_at TEXT NOT NULL  -- ISO 8601 (UTC)
);

CREATE INDEX IF NOT EXISTS reports_user_created_idx
	ON reports (user_id, created_at);
`;

// Kept on globalThis so Next.js dev-mode module reloads reuse one connection.
const globalForDb = globalThis as unknown as { __reportDb?: DatabaseSync };

function dbPath() {
	return resolve(
		/* turbopackIgnore: true */ process.env.REPORT_DB_PATH ?? "report.db",
	);
}

export function reportsDir() {
	return resolve(
		/* turbopackIgnore: true */ process.env.REPORTS_DIR ?? "reports",
	);
}

export function getDb(): DatabaseSync {
	if (!globalForDb.__reportDb) {
		const path = dbPath();
		mkdirSync(dirname(path), { recursive: true });
		const db = new DatabaseSync(path);
		db.exec("PRAGMA journal_mode = WAL");
		db.exec(SCHEMA);
		globalForDb.__reportDb = db;
	}
	return globalForDb.__reportDb;
}
