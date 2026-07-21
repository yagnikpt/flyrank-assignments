import { Elysia, t } from "elysia";
import * as service from "../services/task";

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
					status(500);
					return err;
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
					status(201);
					return task;
				} catch (err) {
					status(500);
					return err;
				}
			},
			{
				body: t.Object({
					title: t.String(),
					done: t.Boolean(),
				}),
			},
		)
		.get("/:id", ({ status, params }) => {
			try {
				const task = service.getTask(Number(params.id));
				return task;
			} catch (err) {
				status(500);
				return err;
			}
		})
		.put(
			"/:id",
			({ status, params, body }) => {
				try {
					const updatedTask = service.updateTask(Number(params.id), body ?? {});
					return updatedTask;
				} catch (err) {
					status(500);
					return err;
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
				status(500);
				return err;
			}
		}),
);

export default router;
