import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";

export default function ProtectedLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<header className="border-b border-border">
				<div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
					<Link href="/" className="font-semibold tracking-tight">
						Supabase Auth API
					</Link>
					<nav className="flex items-center gap-4 text-sm">
						<Link
							href="/docs"
							className="text-muted-foreground hover:text-foreground"
						>
							API docs
						</Link>
						<Suspense>
							<AuthButton />
						</Suspense>
					</nav>
				</div>
			</header>
			<div className="mx-auto w-full max-w-5xl px-5 py-10">{children}</div>
		</main>
	);
}
