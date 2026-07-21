import { openapi } from "@elysia/openapi";
import { Elysia } from "elysia";
import metaRouter from "./router/meta";
import tasksRouter from "./router/tasks";

function createApp() {
	const app = new Elysia();

	app.use(
		openapi({
			provider: "swagger-ui",
			path: "/docs",
			specPath: "/openapi.json",
			documentation: {
				info: {
					title: "BE-01-crud-api",
					description: "A simple CRUD API for managing tasks",
					version: "1.0.0",
				},
			},
		}),
	);

	app.use(metaRouter);
	app.use(tasksRouter);

	return app;
}

export { createApp };
