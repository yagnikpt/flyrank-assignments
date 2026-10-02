# Assignment 4: Supabase Auth API

A Next.js API that delegates account management and JWT authentication to Supabase Auth. It exposes public information, signup/login/logout endpoints, and bearer-token-protected profile and dashboard routes.

## Setup

1. Create a Supabase project.
2. In **Project Settings → API**, copy the project URL and publishable (or legacy anon) key.
3. Create local environment variables:

   ```bash
   cp .env.example .env.local
   ```

4. Add your own values to `.env.local`:

   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_publishable_or_anon_key
   PORT=3000
   ```

5. Start the development server:

   ```bash
   bun run dev
   ```

Open `http://localhost:3000/docs` for Swagger UI.

## API reference

| Method   | Endpoint                   | Auth required | Success                   |
| -------- | -------------------------- | ------------- | ------------------------- |
| `POST`   | `/api/auth/signup`         | No            | `201`                     |
| `POST`   | `/api/auth/login`          | No            | `200` with `access_token` |
| `POST`   | `/api/auth/logout`         | Bearer JWT    | `204`                     |
| `GET`    | `/api/public/info`         | No            | `200`                     |
| `GET`    | `/api/protected/profile`   | Bearer JWT    | `200`                     |
| `GET`    | `/api/protected/dashboard` | Bearer JWT    | `200`                     |
| `GET`    | `/api/tasks`               | Bearer JWT    | `200`                     |
| `POST`   | `/api/tasks`               | Bearer JWT    | `201`                     |
| `GET`    | `/api/tasks/:id`           | Bearer JWT    | `200`                     |
| `PUT`    | `/api/tasks/:id`           | Bearer JWT    | `200`                     |
| `DELETE` | `/api/tasks/:id`           | Bearer JWT    | `204`                     |

### Authentication flow

1. Send `{ "email": "...", "password": "..." }` to `/api/auth/login`.
2. Copy `access_token` from the response.
3. Send the token in protected requests:

   ```bash
   curl http://localhost:3000/api/protected/profile \
     -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
   ```

The reusable guard in [`lib/auth.ts`](lib/auth.ts) rejects missing bearer tokens with `401 { "error": "Access token required" }`. It verifies supplied tokens through `supabase.auth.getUser(token)` and rejects invalid or expired tokens with `401 { "error": "Invalid or expired token" }`.

## User-owned tasks

Before using the task feature, run [`supabase/schema.sql`](supabase/schema.sql) once in your Supabase Dashboard **SQL Editor**. It creates `public.tasks` and enables Row Level Security (RLS), so each user can only read, create, update, and delete rows they own.

After browser sign-in, visit `/protected` to manage your own tasks. The same CRUD feature is also available through the bearer-authenticated `/api/tasks` endpoints.

## Swagger UI

`/docs` serves Swagger UI with a bearer security scheme. Use **Authorize** to paste an access token, then invoke the protected endpoints directly. Before publishing, add a real screenshot of that authorized Swagger UI view to this README.

## Security notes

- `.env` and `.env.local` are ignored by Git; only `.env.example` is committed.
- This project uses a Supabase publishable/anon key only. Never place a Supabase service-role key in browser code or commit it to source control.
