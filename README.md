# Lifestyle Survey App

A small survey application with a React frontend and Supabase persistence.

## Stack

- React, Vite, TypeScript
- React Hook Form, React Query, Zod
- Supabase Postgres

## Project Structure

```text
frontend/
  src/
    components/
    hooks/
    services/
    utils/
shared/
  validation.ts
supabase/
  schema.sql
```

## Setup

```bash
npm install
```

Copy the frontend example environment file and update it with your Supabase project values:

```bash
cp frontend/.env.example frontend/.env.local
```

Run `supabase/schema.sql` in the Supabase SQL Editor before using the app.

## Run Locally

```bash
npm run dev --workspace frontend
```

## Checks

```bash
npm run typecheck
npm run lint
```
