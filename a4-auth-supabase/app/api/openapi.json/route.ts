import { NextResponse } from "next/server";

const bearerAuth = [{ bearerAuth: [] }];

export function GET() {
	return NextResponse.json({
		openapi: "3.0.3",
		info: { title: "Supabase Auth API", version: "1.0.0" },
		paths: {
			"/api/tasks": {
				get: {
					summary: "List the authenticated user's tasks",
					security: bearerAuth,
					responses: {
						"200": { description: "Tasks" },
						"401": { description: "Unauthorized" },
					},
				},
				post: {
					summary: "Create a task for the authenticated user",
					security: bearerAuth,
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/TaskInput" },
							},
						},
					},
					responses: {
						"201": { description: "Task created" },
						"400": { description: "Invalid input" },
						"401": { description: "Unauthorized" },
					},
				},
			},
			"/api/tasks/{id}": {
				get: {
					summary: "Get one of the authenticated user's tasks",
					security: bearerAuth,
					parameters: [
						{
							name: "id",
							in: "path",
							required: true,
							schema: { type: "integer" },
						},
					],
					responses: {
						"200": { description: "Task" },
						"401": { description: "Unauthorized" },
						"404": { description: "Not found" },
					},
				},
				put: {
					summary: "Update one of the authenticated user's tasks",
					security: bearerAuth,
					parameters: [
						{
							name: "id",
							in: "path",
							required: true,
							schema: { type: "integer" },
						},
					],
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/TaskInput" },
							},
						},
					},
					responses: {
						"200": { description: "Task updated" },
						"400": { description: "Invalid input" },
						"401": { description: "Unauthorized" },
						"404": { description: "Not found" },
					},
				},
				delete: {
					summary: "Delete one of the authenticated user's tasks",
					security: bearerAuth,
					parameters: [
						{
							name: "id",
							in: "path",
							required: true,
							schema: { type: "integer" },
						},
					],
					responses: {
						"204": { description: "Task deleted" },
						"401": { description: "Unauthorized" },
						"404": { description: "Not found" },
					},
				},
			},
			"/api/auth/signup": {
				post: {
					summary: "Create an account",
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Credentials" },
							},
						},
					},
					responses: {
						"201": { description: "Account created" },
						"400": { description: "Invalid input" },
					},
				},
			},
			"/api/auth/login": {
				post: {
					summary: "Log in and return an access token",
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/Credentials" },
							},
						},
					},
					responses: {
						"200": { description: "Logged in" },
						"400": { description: "Missing input" },
						"401": { description: "Invalid credentials" },
					},
				},
			},
			"/api/auth/logout": {
				post: {
					summary: "Log out",
					security: bearerAuth,
					responses: {
						"204": { description: "Logged out" },
						"401": { description: "Unauthorized" },
					},
				},
			},
			"/api/public/info": {
				get: {
					summary: "Read public information",
					responses: { "200": { description: "Public response" } },
				},
			},
			"/api/protected/profile": {
				get: {
					summary: "Read the authenticated user profile",
					security: bearerAuth,
					responses: {
						"200": { description: "Profile" },
						"401": { description: "Unauthorized" },
					},
				},
			},
			"/api/protected/dashboard": {
				get: {
					summary: "Read the authenticated user dashboard",
					security: bearerAuth,
					responses: {
						"200": { description: "Dashboard" },
						"401": { description: "Unauthorized" },
					},
				},
			},
		},
		components: {
			securitySchemes: {
				bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
			},
			schemas: {
				Credentials: {
					type: "object",
					required: ["email", "password"],
					properties: {
						email: { type: "string", format: "email" },
						password: { type: "string", format: "password" },
					},
				},
				TaskInput: {
					type: "object",
					properties: {
						title: { type: "string" },
						done: { type: "boolean" },
					},
				},
			},
		},
	});
}
