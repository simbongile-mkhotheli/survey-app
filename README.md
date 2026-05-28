# Lifestyle Survey App

A small full-stack survey application with a React frontend and an Express + Prisma backend.

## Stack

- Frontend: React, Vite, TypeScript, React Hook Form, React Query, Zod
- Backend: Express, Prisma, PostgreSQL, TypeScript, Zod
- Shared validation between frontend and backend

## Project Structure

```text
backend/
  prisma/
  src/
    controllers/
    middleware/
    repositories/
    routes/
    utils/
    validation/
frontend/
  src/
    components/
    config/
    hooks/
    services/
    utils/
shared/
  validation.ts
```

## Setup

```bash
npm install
```

Copy the example environment files and update them for your machine:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Run Locally

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

## Checks

```bash
npm run typecheck
npm run lint
```
