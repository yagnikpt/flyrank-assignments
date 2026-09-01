import { NextResponse } from "next/server";

const bearerAuth = [{ bearerAuth: [] }];

export function GET() {
	return NextResponse.json({
		openapi: "3.0.3",
		info: { title: "Supabase Auth API", version: "1.0.0" },
		paths: {
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
			},
		},
	});
}
