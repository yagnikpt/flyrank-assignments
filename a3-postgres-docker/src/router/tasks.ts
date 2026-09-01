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

router.get("/stats", async ({ status }) => {
	try {
		return await service.getStats();
	} catch (error) {
		return respondWithError(status, error);
	}
});

router.get("/reset", async ({ status }) => {
	try {
		return await service.resetTasks();
	} catch (error) {
		return respondWithError(status, error);
	}
});

router.group("/tasks", (app) =>
	app
		.get(
			"",
			async ({ query, status }) => {
				try {
					return await service.listTasks({
						done: query.done,
						search: query.search,
					});
				} catch (error) {
					return respondWithError(status, error);
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
			async ({ body, status }) => {
				try {
					const task = await service.createTask(body ?? {});
					return status(201, task);
				} catch (error) {
					return respondWithError(status, error);
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
		.get("/:id", async ({ status, params }) => {
			try {
				return await service.getTask(Number(params.id));
			} catch (error) {
				return respondWithError(status, error);
			}
		})
		.put(
			"/:id",
			async ({ status, params, body }) => {
				try {
					return await service.updateTask(Number(params.id), body ?? {});
				} catch (error) {
					return respondWithError(status, error);
				}
			},
			{
				body: t.Object({
					title: t.Optional(t.String()),
					done: t.Optional(t.Boolean()),
				}),
			},
		)
		.delete("/:id", async ({ status, params }) => {
			try {
				return await service.deleteTask(Number(params.id));
			} catch (error) {
				return respondWithError(status, error);
			}
		}),
);

export default router;
