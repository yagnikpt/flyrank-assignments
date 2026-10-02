"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Report = { id: string; created_at: string; file: string };

async function accessToken(): Promise<string> {
	const { data } = await createClient().auth.getSession();
	if (!data.session?.access_token)
		throw new Error("Your session has expired. Please log in again.");
	return data.session.access_token;
}

export function ReportManager() {
	const [reports, setReports] = useState<Report[]>([]);
	const [loading, setLoading] = useState(true);
	const [generating, setGenerating] = useState(false);
	const [downloading, setDownloading] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	const loadReports = useCallback(async () => {
		try {
			setError(null);
			const token = await accessToken();
			const response = await fetch("/api/reports", {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok) throw new Error("Unable to load reports");
			setReports((await response.json()) as Report[]);
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Unable to load reports",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadReports();
	}, [loadReports]);

	async function generate(force: boolean) {
		try {
			setGenerating(true);
			setError(null);
			setNotice(null);
			const token = await accessToken();
			const response = await fetch("/api/reports", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ force }),
			});
			if (!response.ok) throw new Error("Unable to generate report");
			// 201 = new PDF; 200 = today's report already existed (idempotent).
			setNotice(
				response.status === 201
					? "New report generated."
					: "You already generated a report today, so that one is shown. Use “Generate new anyway” for a fresh copy.",
			);
			await loadReports();
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Unable to generate report",
			);
		} finally {
			setGenerating(false);
		}
	}

	// The file endpoint needs the bearer token, so a plain <a href> can't be used.
	async function download(report: Report) {
		try {
			setDownloading(report.id);
			setError(null);
			const token = await accessToken();
			const response = await fetch(report.file, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok) throw new Error("Unable to download report");

			const url = URL.createObjectURL(await response.blob());
			const link = document.createElement("a");
			link.href = url;
			link.download = `sales-report-${report.created_at.slice(0, 10)}.pdf`;
			link.click();
			URL.revokeObjectURL(url);
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Unable to download report",
			);
		} finally {
			setDownloading(null);
		}
	}

	return (
		<section className="rounded-xl border border-border bg-card p-6">
			<h2 className="text-xl font-semibold">Sales reports</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				Generate a PDF from the orders database and download it. Only you can
				see your reports.
			</p>
			<div className="mt-5 flex flex-wrap gap-3">
				<button
					type="button"
					onClick={() => void generate(false)}
					disabled={generating}
					className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
				>
					{generating ? "Generating…" : "Generate report"}
				</button>
				<button
					type="button"
					onClick={() => void generate(true)}
					disabled={generating}
					className="rounded-md border border-input px-4 py-2 text-sm font-medium disabled:opacity-50"
				>
					Generate new anyway
				</button>
			</div>
			{notice && <p className="mt-3 text-sm text-muted-foreground">{notice}</p>}
			{error && <p className="mt-3 text-sm text-destructive">{error}</p>}
			{loading ? (
				<p className="mt-5 text-sm text-muted-foreground">Loading reports…</p>
			) : reports.length === 0 ? (
				<p className="mt-5 text-sm text-muted-foreground">No reports yet.</p>
			) : (
				<ul className="mt-5 divide-y divide-border">
					{reports.map((report) => (
						<li key={report.id} className="flex items-center gap-3 py-3">
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium">
									{new Date(report.created_at).toLocaleString()}
								</p>
								<p className="truncate font-mono text-xs text-muted-foreground">
									{report.id}
								</p>
							</div>
							<button
								type="button"
								onClick={() => void download(report)}
								disabled={downloading === report.id}
								className="text-sm font-medium text-emerald-600 hover:underline disabled:opacity-50 dark:text-emerald-400"
							>
								{downloading === report.id ? "Downloading…" : "Download PDF"}
							</button>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
