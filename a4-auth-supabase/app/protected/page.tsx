import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function DashboardContent() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getUser();

	if (error || !data.user) redirect("/auth/login");

	const user = data.user;
	return (
		<div className="w-full space-y-8">
			<section className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
				<p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
					Authenticated session
				</p>
				<h1 className="mt-3 text-3xl font-bold tracking-tight">
					Welcome back{user.email ? `, ${user.email}` : ""}.
				</h1>
				<p className="mt-3 max-w-2xl text-muted-foreground">
					Your cookie-based Supabase session grants access to this browser
					dashboard. The API endpoints use the same Supabase identity provider
					but require a Bearer JWT in their Authorization header.
				</p>
			</section>

			<section className="grid gap-4 sm:grid-cols-2">
				<div className="rounded-xl border border-border bg-card p-5">
					<p className="text-sm text-muted-foreground">User ID</p>
					<p className="mt-2 break-all font-mono text-sm">{user.id}</p>
				</div>
				<div className="rounded-xl border border-border bg-card p-5">
					<p className="text-sm text-muted-foreground">Account created</p>
					<p className="mt-2 font-medium">
						{new Date(user.created_at).toLocaleString()}
					</p>
				</div>
			</section>

			<section className="rounded-xl border border-border bg-card p-6">
				<h2 className="text-xl font-semibold">Test the protected API</h2>
				<p className="mt-2 text-muted-foreground">
					Log in through the API, copy its access token, then use Swagger UI’s
					Authorize control to call the protected profile and dashboard
					endpoints.
				</p>
				<Link
					href="/docs"
					className="mt-5 inline-flex rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
				>
					Open API documentation
				</Link>
			</section>
		</div>
	);
}

export default function ProtectedPage() {
	return (
		<Suspense
			fallback={<p className="text-muted-foreground">Loading dashboard…</p>}
		>
			<DashboardContent />
		</Suspense>
	);
}
