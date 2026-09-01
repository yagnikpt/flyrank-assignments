# BE-04: PostgreSQL Task API with Docker

This project upgrades the Assignment 2 task API from SQLite to PostgreSQL. It runs the API and database together through Docker Compose, and PostgreSQL data survives restarts through a named Docker volume.

## Architecture

```text
Client → Elysia routes → task service → PostgreSQL repository → Postgres container + volume
```

The public API remains the same as Assignment 2: route paths, request bodies, validation rules, and response shapes are unchanged. The repository is the storage-specific layer that was swapped from SQLite to PostgreSQL. Because PostgreSQL access is asynchronous, the repository and its callers use `async`/`await`; the service validation and route behavior are otherwise unchanged.

## Prerequisites

- [Docker Compose](https://docs.docker.com/compose/)
- Bun 1.4+ only if running the API outside Docker

## Start the full stack

A local `.env` is included for the development credentials. For a fresh clone, create one from the committed template:

```bash
cp .env.example .env
docker compose up --build
```

The API is available at `http://localhost:3000`, and its OpenAPI documentation is at `http://localhost:3000/docs`.

To stop containers while retaining data:

```bash
docker compose down
```

To remove data as well:

```bash
docker compose down -v
```

## Environment variables

`.env` is gitignored. `.env.example` is committed as the required template.

| Variable            | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `DATABASE_URL`      | PostgreSQL connection string for running the app from the host |
| `POSTGRES_DB`       | Database created by the Postgres container                     |
| `POSTGRES_USER`     | Postgres application user                                      |
| `POSTGRES_PASSWORD` | Postgres application password                                  |

Inside Compose, the app receives a connection string that points to the `db` service hostname rather than `localhost`.

## Database initialization and persistence

[`db/init.sql`](db/init.sql) creates the `tasks` table and inserts three example tasks only when the new database is empty. The official Postgres image runs this script once when it initializes the `postgres_data` named volume.

The schema is:

| Column  | Type                 | Description      |
| ------- | -------------------- | ---------------- |
| `id`    | `SERIAL PRIMARY KEY` | Unique task ID   |
| `title` | `TEXT NOT NULL`      | Task title       |
| `done`  | `BOOLEAN NOT NULL`   | Completion state |

The `postgres_data` volume is mounted at Postgres's data directory, so stopping or recreating containers does not remove tasks.

## API

| Method   | Endpoint             | Description                          |
| -------- | -------------------- | ------------------------------------ |
| `GET`    | `/health`            | Health check                         |
| `GET`    | `/tasks`             | List tasks                           |
| `GET`    | `/tasks/:id`         | Get a task; unknown IDs return `404` |
| `POST`   | `/tasks`             | Create a task; returns `201`         |
| `PUT`    | `/tasks/:id`         | Update a task                        |
| `DELETE` | `/tasks/:id`         | Delete a task                        |
| `GET`    | `/tasks?search=milk` | PostgreSQL `ILIKE` search            |
| `GET`    | `/tasks?done=true`   | Filter by completion state           |
| `GET`    | `/stats`             | SQL-backed task totals               |

Example:

```bash
curl -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Postgres persists this task"}'
```

## Persistence check performed

Use these commands to verify persistence across both application and database container restarts:

```bash
# Create a record and note its id.
curl -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Persistence check"}'

# Restart both services without removing the named volume.
docker compose restart app db

# The created row must still be returned.
curl http://localhost:3000/tasks
```

The persistence guarantee comes from the `postgres_data` named volume. Do not use `docker compose down -v` during this check because that intentionally removes it.
