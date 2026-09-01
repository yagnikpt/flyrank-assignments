import { Elysia, t } from "elysia";
import { NotFoundError, ValidationError } from "../errors";
import * as service from "../services/task";

function respondWithError(
	status: (code: number, response: { error: string }) => unknown,
	error: unknown,
) {
	if (error instanceof NotFoundError) {
		return status(404, { error: "Task not found" });
	}

	if (error instanceof ValidationError) {
		return status(400, { error: error.message });
	}

	return status(500, { error: "Internal server error" });
}

const router = new Elysia();

router.get("/stats", service.getStats);

router.get("/reset", service.resetTasks);

router.group("/tasks", (app) =>
	app
		.get(
			"",
			({ query, status }) => {
				try {
					const tasks = service.listTasks({
						done: query.done,
						search: query.search,
					});
					return tasks;
				} catch (err) {
					return respondWithError(status, err);
				}
			},
			{
				query: t.Object({
					search: t.Optional(t.String()),
					done: t.Optional(t.String()),
				}),
			},
		)
		.post(
			"",
			({ body, status }) => {
				try {
					const task = service.createTask(body ?? {});
					return status(201, task);
				} catch (err) {
					return respondWithError(status, err);
				}
			},
			{
				body: t.Optional(
					t.Object({
						title: t.Optional(t.String()),
					}),
				),
			},
		)
		.get("/:id", ({ status, params }) => {
			try {
				const task = service.getTask(Number(params.id));
				return task;
			} catch (err) {
				return respondWithError(status, err);
			}
		})
		.put(
			"/:id",
			({ status, params, body }) => {
				try {
					const updatedTask = service.updateTask(Number(params.id), body ?? {});
					return updatedTask;
				} catch (err) {
					return respondWithError(status, err);
				}
			},
			{
				body: t.Object({
					title: t.Optional(t.String()),
					done: t.Optional(t.Boolean()),
				}),
			},
		)
		.delete("/:id", ({ status, params }) => {
			try {
				return service.deleteTask(Number(params.id));
			} catch (err) {
				return respondWithError(status, err);
			}
		}),
);

export default router;
