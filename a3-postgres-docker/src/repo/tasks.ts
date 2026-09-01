import { SQL } from "bun";

type Task = { id: number; title: string; done: boolean };
type TaskFilters = { done?: boolean; search?: string };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error("DATABASE_URL must be set");
}

const sql = new SQL(databaseUrl);

async function findAll({ done, search }: TaskFilters = {}): Promise<Task[]> {
	if (done !== undefined && search !== undefined) {
		return (await sql`
			SELECT id, title, done
			FROM tasks
			WHERE done = ${done} AND title ILIKE ${`%${search}%`}
			ORDER BY id
		`) as Task[];
	}

	if (done !== undefined) {
		return (await sql`
			SELECT id, title, done FROM tasks WHERE done = ${done} ORDER BY id
		`) as Task[];
	}

	if (search !== undefined) {
		return (await sql`
			SELECT id, title, done FROM tasks WHERE title ILIKE ${`%${search}%`} ORDER BY id
		`) as Task[];
	}

	return (await sql`SELECT id, title, done FROM tasks ORDER BY id`) as Task[];
}

async function findById(id: number): Promise<Task | null> {
	const [task] = (await sql`
		SELECT id, title, done FROM tasks WHERE id = ${id}
	`) as Task[];
	return task ?? null;
}

async function create({ title, done }: Omit<Task, "id">): Promise<Task> {
	const [task] = (await sql`
		INSERT INTO tasks (title, done) VALUES (${title}, ${done})
		RETURNING id, title, done
	`) as Task[];

	if (!task) throw new Error("Failed to create task");
	return task;
}

async function update(
	id: number,
	changes: Partial<Omit<Task, "id">>,
): Promise<Task | null> {
	const hasTitle = changes.title !== undefined;
	const hasDone = changes.done !== undefined;

	if (!hasTitle && !hasDone) return findById(id);

	const [task] = (await sql`
		UPDATE tasks
		SET
			title = CASE WHEN ${hasTitle} THEN ${changes.title ?? null} ELSE title END,
			done = CASE WHEN ${hasDone} THEN ${changes.done ?? false} ELSE done END
		WHERE id = ${id}
		RETURNING id, title, done
	`) as Task[];

	return task ?? null;
}

async function remove(id: number): Promise<boolean> {
	const result = await sql`DELETE FROM tasks WHERE id = ${id}`;
	return result.count > 0;
}

async function getStats(): Promise<{ total: number; done: number }> {
	const [stats] = (await sql`
		SELECT COUNT(*) AS total,
		       COUNT(*) FILTER (WHERE done) AS done
		FROM tasks
	`) as { total: number | string; done: number | string }[];

	return { total: Number(stats?.total ?? 0), done: Number(stats?.done ?? 0) };
}

async function reset(): Promise<Task[]> {
	await sql`DELETE FROM tasks`;
	return findAll();
}

export { create, findAll, findById, getStats, remove, reset, update };
