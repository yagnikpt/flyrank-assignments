import { Elysia } from "elysia";

const router = new Elysia();

router.get("/", {
	name: "Task API",
	version: "1.0",
	endpoints: ["/tasks", "/stats", "/reset"],
});

router.get("/health", { status: "ok" });

export default router;
