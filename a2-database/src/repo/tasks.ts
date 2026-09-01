import { Database } from "bun:sqlite";

type Task = { id: number; title: string; done: boolean };
type TaskRow = { id: number; title: string; done: number };

type TaskFilters = { done?: boolean; search?: string };

const db = new Database(new URL("../../tasks.db", import.meta.url).pathname);

db.run("PRAGMA journal_mode = WAL;");
db.run(
	"CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL, done BOOLEAN NOT NULL)",
);

const taskCount = db.query("SELECT COUNT(*) AS count FROM tasks").get() as {
	count: number;
};

if (taskCount.count === 0) {
	const insertSeed = db.query("INSERT INTO tasks (title, done) VALUES (?, ?)");
	insertSeed.run("Buy groceries", 0);
	insertSeed.run("Walk the dog", 1);
	insertSeed.run("Read a book", 0);
}

function toTask(row: TaskRow): Task {
	return { ...row, done: Boolean(row.done) };
}

function findAll({ done, search }: TaskFilters = {}): Task[] {
	const conditions: string[] = [];
	const values: (number | string)[] = [];

	if (done !== undefined) {
		conditions.push("done = ?");
		values.push(done ? 1 : 0);
	}

	if (search !== undefined) {
		conditions.push("title LIKE ? COLLATE NOCASE");
		values.push(`%${search}%`);
	}

	const where =
		conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
	const rows = db
		.query(`SELECT id, title, done FROM tasks${where} ORDER BY id`)
		.all(...values) as TaskRow[];
	return rows.map(toTask);
}

function findById(id: number): Task | null {
	const row = db
		.query("SELECT id, title, done FROM tasks WHERE id = ?")
		.get(id) as TaskRow | null;
	return row ? toTask(row) : null;
}

function create({ title, done }: Omit<Task, "id">): Task {
	const result = db
		.query("INSERT INTO tasks (title, done) VALUES (?, ?)")
		.run(title, done ? 1 : 0);
	const task = findById(Number(result.lastInsertRowid));
	if (!task) throw new Error("Failed to read newly created task");
	return task;
}

function update(id: number, changes: Partial<Omit<Task, "id">>): Task | null {
	if (!findById(id)) return null;

	const hasTitle = changes.title !== undefined;
	const hasDone = changes.done !== undefined;
	db.query(
		`UPDATE tasks
		 SET title = CASE WHEN ? THEN ? ELSE title END,
		     done = CASE WHEN ? THEN ? ELSE done END
		 WHERE id = ?`,
	).run(
		hasTitle ? 1 : 0,
		changes.title ?? null,
		hasDone ? 1 : 0,
		changes.done ? 1 : 0,
		id,
	);

	return findById(id);
}

function remove(id: number): boolean {
	return db.query("DELETE FROM tasks WHERE id = ?").run(id).changes > 0;
}

function getStats() {
	return db
		.query(
			"SELECT COUNT(*) AS total, SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) AS done FROM tasks",
		)
		.get() as { total: number; done: number };
}

function reset(): Task[] {
	db.run("DELETE FROM tasks");
	return findAll();
}

export { create, findAll, findById, getStats, remove, reset, update };
