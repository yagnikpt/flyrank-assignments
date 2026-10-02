"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Task = {
	id: number;
	title: string;
	done: boolean;
	created_at: string;
	updated_at: string;
};

async function accessToken(): Promise<string> {
	const { data } = await createClient().auth.getSession();
	if (!data.session?.access_token)
		throw new Error("Your session has expired. Please log in again.");
	return data.session.access_token;
}

export function TaskManager() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [title, setTitle] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	const loadTasks = useCallback(async () => {
		try {
			setError(null);
			const token = await accessToken();
			const response = await fetch("/api/tasks", {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok) throw new Error("Unable to load tasks");
			setTasks((await response.json()) as Task[]);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Unable to load tasks");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadTasks();
	}, [loadTasks]);

	async function createTask(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const taskTitle = title.trim();
		if (!taskTitle) return;

		try {
			setSubmitting(true);
			setError(null);
			const token = await accessToken();
			const response = await fetch("/api/tasks", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ title: taskTitle }),
			});
			if (!response.ok) throw new Error("Unable to create task");
			const created = (await response.json()) as Task;
			setTasks((current) => [...current, created]);
			setTitle("");
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Unable to create task",
			);
		} finally {
			setSubmitting(false);
		}
	}

	async function updateTask(task: Task, done: boolean) {
		try {
			setError(null);
			const token = await accessToken();
			const response = await fetch(`/api/tasks/${task.id}`, {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ done }),
			});
			if (!response.ok) throw new Error("Unable to update task");
			const updated = (await response.json()) as Task;
			setTasks((current) =>
				current.map((item) => (item.id === updated.id ? updated : item)),
			);
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Unable to update task",
			);
		}
	}

	async function deleteTask(id: number) {
		try {
			setError(null);
			const token = await accessToken();
			const response = await fetch(`/api/tasks/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok) throw new Error("Unable to delete task");
			setTasks((current) => current.filter((task) => task.id !== id));
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Unable to delete task",
			);
		}
	}

	return (
		<section className="rounded-xl border border-border bg-card p-6">
			<h2 className="text-xl font-semibold">My tasks</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				Only you can access these tasks.
			</p>
			<form onSubmit={createTask} className="mt-5 flex gap-3">
				<input
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					placeholder="Add a task"
					className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
				/>
				<button
					type="submit"
					disabled={submitting}
					className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
				>
					Add task
				</button>
			</form>
			{error && <p className="mt-3 text-sm text-destructive">{error}</p>}
			{loading ? (
				<p className="mt-5 text-sm text-muted-foreground">Loading tasks…</p>
			) : tasks.length === 0 ? (
				<p className="mt-5 text-sm text-muted-foreground">No tasks yet.</p>
			) : (
				<ul className="mt-5 divide-y divide-border">
					{tasks.map((task) => (
						<li key={task.id} className="flex items-center gap-3 py-3">
							<input
								type="checkbox"
								checked={task.done}
								onChange={(event) =>
									void updateTask(task, event.target.checked)
								}
								aria-label={`Mark ${task.title} as ${task.done ? "open" : "done"}`}
							/>
							<span
								className={`min-w-0 flex-1 ${task.done ? "text-muted-foreground line-through" : ""}`}
							>
								{task.title}
							</span>
							<button
								type="button"
								onClick={() => void deleteTask(task.id)}
								className="text-sm font-medium text-destructive hover:underline"
							>
								Delete
							</button>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
