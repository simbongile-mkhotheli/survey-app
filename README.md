# Lifestyle Survey App

A focused survey application for collecting lifestyle preferences and showing
aggregate results. The app is intentionally small: React handles the user
experience, Zod validates form data, and Supabase stores survey responses.

## Stack

- React, Vite, TypeScript
- React Hook Form, React Query, Zod
- Supabase Postgres with row-level security

## What It Does

- Collects personal details, food preferences, and preference ratings.
- Validates submissions in the browser before writing to Supabase.
- Stores survey responses in Supabase Postgres.
- Loads aggregate results through a Supabase RPC instead of exposing raw rows.

## Architecture

```text
React form
  -> Zod validation
  -> Supabase insert into SurveyResponse

Results page
  -> Supabase get_survey_results() RPC
  -> aggregate metrics rendered in React
```

The frontend writes survey submissions directly with the Supabase publishable
key. Public results are read through `get_survey_results()`, which returns only
aggregate values. Anonymous users should not have direct select access to raw
survey rows because those rows contain names, emails, and contact numbers.

## Project Structure

```text
frontend/
  src/
    components/
    constants/
    hooks/
    services/
    utils/
shared/
  validation.ts
supabase/
  schema.sql
```

## Setup

Install dependencies:

```bash
npm install
```

Create the local frontend environment file:

```bash
cp frontend/.env.example frontend/.env.local
```

Set these values in `frontend/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL Editor before
using the app. It creates the survey table, indexes, insert policy, and aggregate
results RPC.

## Run Locally

```bash
npm run dev --workspace frontend
```

## Checks

```bash
npm run typecheck
npm run lint --workspace frontend
npm run build --workspace frontend
```

## Deployment Notes

For a hosted frontend, configure the same `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` values in the hosting provider. Do not expose a
Supabase secret or service-role key in the frontend.

If provisioning a fresh Supabase project, run `supabase/schema.sql` before
testing submissions or results.
