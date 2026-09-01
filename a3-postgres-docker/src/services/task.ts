import { NotFoundError, ValidationError } from "../errors";
import * as repo from "../repo/tasks";

async function listTasks({ done, search }: { done?: string; search?: string }) {
	const filters: { done?: boolean; search?: string } = {};

	if (done !== undefined) {
		if (done !== "true" && done !== "false") {
			throw new ValidationError("done must be true or false");
		}
		filters.done = done === "true";
	}

	if (search !== undefined) {
		const word = String(search).trim();
		if (word === "") {
			throw new ValidationError("search must not be empty");
		}
		filters.search = word;
	}

	return repo.findAll(filters);
}

async function getTask(id: number) {
	const task = await repo.findById(id);
	if (!task) throw new NotFoundError("Task not found");
	return task;
}

async function createTask(body: { title?: string }) {
	const { title } = body;
	if (title === undefined || title === null || String(title).trim() === "") {
		throw new ValidationError("title is required and cannot be empty");
	}
	return repo.create({ title: String(title).trim(), done: false });
}

async function updateTask(
	id: number,
	body: { title?: string; done?: boolean },
) {
	const hasTitle = Object.hasOwn(body, "title");
	const hasDone = Object.hasOwn(body, "done");

	if (!hasTitle && !hasDone) {
		throw new ValidationError("request body must include title and/or done");
	}

	const changes: { title?: string; done?: boolean } = {};

	if (hasTitle) {
		if (body.title === null || String(body.title).trim() === "") {
			throw new ValidationError("title cannot be empty");
		}
		changes.title = String(body.title).trim();
	}

	if (hasDone) {
		if (typeof body.done !== "boolean") {
			throw new ValidationError("done must be a boolean");
		}
		changes.done = body.done;
	}

	const updated = await repo.update(id, changes);
	if (!updated) throw new NotFoundError("Task not found");
	return updated;
}

async function deleteTask(id: number) {
	const removed = await repo.remove(id);
	if (!removed) throw new NotFoundError("Task not found");
	return removed;
}

async function getStats() {
	const { total, done } = await repo.getStats();
	return { total, done, open: total - done };
}

function resetTasks() {
	return repo.reset();
}

export {
	createTask,
	deleteTask,
	getStats,
	getTask,
	listTasks,
	resetTasks,
	updateTask,
};
