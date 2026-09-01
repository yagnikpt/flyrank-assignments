# BE-02: SQLite Task CRUD API

A Bun/Elysia task API that keeps the Assignment 1 CRUD interface while replacing in-memory storage with SQLite persistence.

## Why SQLite?

SQLite is lightweight, requires no separate database server, and stores the complete database in one local file. It is a good fit for this small API and demonstrates persistence without adding infrastructure.

## Prerequisites

- [Bun](https://bun.sh/) 1.0 or newer

## Run locally

```bash
bun install
bun run dev
```

The server starts on `http://localhost:3000` by default. Set `PORT` to use another port.

On first start, the application automatically creates `tasks.db`, creates the `tasks` table, and inserts three example tasks. Later starts preserve all existing data and do not duplicate the seed tasks.

## Database

The database is stored at `tasks.db` in the project root. It is intentionally ignored by Git, along with its SQLite journal files, so every clone creates a fresh local database.

The `tasks` table contains:

| Column  | Type                | Description       |
| ------- | ------------------- | ----------------- |
| `id`    | integer primary key | Unique task ID    |
| `title` | text                | Task title        |
| `done`  | boolean             | Completion status |

Use [DB Browser for SQLite](https://sqlitebrowser.org/) to open `tasks.db` and inspect or edit the table.

Example query executed against the database:

```sql
SELECT * FROM tasks WHERE done = 1;
```

## API

| Method   | Endpoint     | Description                            |
| -------- | ------------ | -------------------------------------- |
| `GET`    | `/health`    | Health check                           |
| `GET`    | `/tasks`     | List tasks                             |
| `GET`    | `/tasks/:id` | Get a task; unknown IDs return `404`   |
| `POST`   | `/tasks`     | Create a task; returns `201`           |
| `PUT`    | `/tasks/:id` | Update a task                          |
| `DELETE` | `/tasks/:id` | Delete a task                          |
| `GET`    | `/stats`     | SQL-backed task totals                 |
| `GET`    | `/reset`     | Delete every task (development helper) |
| `GET`    | `/docs`      | OpenAPI documentation                  |

### SQL-backed optional filters

- `GET /tasks?search=milk` searches task titles with `LIKE`.
- `GET /tasks?done=true` and `GET /tasks?done=false` filter by completion state.

### Examples

```bash
curl http://localhost:3000/tasks

curl -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Finish the database assignment"}'

curl -X PUT http://localhost:3000/tasks/1 \
  -H 'Content-Type: application/json' \
  -d '{"done":true}'
```

## Database viewer screenshot

Open the locally generated `tasks.db` in DB Browser for SQLite and add a screenshot here before publishing the repository. A real screenshot cannot be generated from this headless development environment.
