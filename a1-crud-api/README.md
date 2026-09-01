# A1: Task CRUD API

A small REST API for managing tasks, built with [Elysia](https://elysiajs.com/) and Bun. This project uses an in-memory array, so its data resets whenever the server restarts.

## Prerequisites

- [Bun](https://bun.sh/) 1.0 or newer

## Run locally

```bash
bun install
bun run dev
```

The server starts on `http://localhost:3000` by default. Set `PORT` to use a different port.

## API

| Method   | Endpoint     | Description                       |
| -------- | ------------ | --------------------------------- |
| `GET`    | `/health`    | Health check                      |
| `GET`    | `/tasks`     | List every task                   |
| `GET`    | `/tasks/:id` | Get one task                      |
| `POST`   | `/tasks`     | Create a task                     |
| `PUT`    | `/tasks/:id` | Update a task                     |
| `DELETE` | `/tasks/:id` | Delete a task                     |
| `GET`    | `/stats`     | Task totals                       |
| `GET`    | `/reset`     | Restore the initial example tasks |
| `GET`    | `/docs`      | OpenAPI documentation             |

### Examples

Open the API documentation in your browser: `http://localhost:3000/docs`

Create a task:

```bash
curl -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Finish the assignment"}'
```

Mark it complete:

```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H 'Content-Type: application/json' \
  -d '{"done":true}'
```

The optional query parameters `?done=true` / `?done=false` and `?search=word` filter the task list.
