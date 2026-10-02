import Link from "next/link";

const endpoints = [
	["POST", "/api/auth/signup", "Create a Supabase account", "Public"],
	["POST", "/api/auth/login", "Receive an access token", "Public"],
	["POST", "/api/auth/logout", "End the current session", "Bearer JWT"],
	["GET", "/api/public/info", "Read public information", "Public"],
	[
		"GET",
		"/api/protected/profile",
		"Read verified profile metadata",
		"Bearer JWT",
	],
	[
		"GET",
		"/api/protected/dashboard",
		"Read a protected dashboard",
		"Bearer JWT",
	],
];

export default function Home() {
	return (
		<main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
			<div className="mx-auto max-w-5xl">
				<header className="flex items-center justify-between border-b border-slate-800 pb-6">
					<p className="text-lg font-semibold tracking-tight">
						Supabase Auth API
					</p>
					<nav className="flex items-center gap-3 text-sm font-semibold">
						<Link
							href="/auth/login"
							className="rounded-md px-4 py-2 text-slate-200 transition hover:bg-slate-800"
						>
							Log in
						</Link>
						<Link
							href="/auth/sign-up"
							className="rounded-md bg-emerald-400 px-4 py-2 text-slate-950 transition hover:bg-emerald-300"
						>
							Sign up
						</Link>
					</nav>
				</header>

				<section className="py-20 sm:py-28">
					<p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
						FlyRank · Assignment 4
					</p>
					<h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
						JWT authentication with Supabase and Next.js.
					</h1>
					<p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
						A small API demonstrating signup, login, token verification,
						reusable bearer authentication, and protected routes.
					</p>
					<div className="mt-9 flex flex-wrap gap-3">
						<Link
							href="/docs"
							className="rounded-md bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
						>
							Explore the API
						</Link>
						<Link
							href="/api/public/info"
							className="rounded-md border border-slate-700 px-5 py-3 font-semibold transition hover:border-slate-500 hover:bg-slate-900"
						>
							Try public endpoint
						</Link>
					</div>
				</section>

				<section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
					<h2 className="text-2xl font-semibold">Endpoints</h2>
					<div className="mt-6 overflow-x-auto">
						<table className="w-full min-w-[38rem] text-left text-sm">
							<thead className="border-b border-slate-700 text-slate-400">
								<tr>
									<th className="pb-3 font-medium">Method</th>
									<th className="pb-3 font-medium">Route</th>
									<th className="pb-3 font-medium">Purpose</th>
									<th className="pb-3 font-medium">Authorization</th>
								</tr>
							</thead>
							<tbody>
								{endpoints.map(([method, route, purpose, authorization]) => (
									<tr
										key={route}
										className="border-b border-slate-800 last:border-0"
									>
										<td className="py-4 font-mono text-emerald-400">
											{method}
										</td>
										<td className="py-4 font-mono text-slate-200">{route}</td>
										<td className="py-4 text-slate-300">{purpose}</td>
										<td className="py-4 text-slate-300">{authorization}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<section className="grid gap-5 py-14 sm:grid-cols-3">
					{[
						[
							"1",
							"Sign up or log in",
							"Send credentials to the auth endpoints to create an account or receive a JWT.",
						],
						[
							"2",
							"Authorize",
							"Paste the token into Swagger UI's Authorize dialog or send it as a Bearer header.",
						],
						[
							"3",
							"Access protected routes",
							"The shared guard verifies the token with Supabase before the handler runs.",
						],
					].map(([number, title, description]) => (
						<article
							key={number}
							className="rounded-xl border border-slate-800 p-5"
						>
							<p className="text-sm font-semibold text-emerald-400">
								STEP {number}
							</p>
							<h2 className="mt-3 text-lg font-semibold">{title}</h2>
							<p className="mt-2 leading-6 text-slate-400">{description}</p>
						</article>
					))}
				</section>
			</div>
		</main>
	);
}
