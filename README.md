# Lifestyle Survey App

A simple full-stack survey application with a React frontend and an Express + Prisma backend.

## What’s included

- Frontend built with React, Vite, TypeScript, and Zod
- Backend built with Express, Prisma, PostgreSQL, and TypeScript
- Shared validation helpers and API response handling
- Basic survey submission and results views

## Project structure

```text
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── errors/
│   │   ├── interfaces/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── test/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validation/
│   │   ├── container.ts
│   │   └── server.ts
│   ├── prisma/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── test/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js
- PostgreSQL
- npm

## Setup

Install dependencies from the repo root:

```bash
npm install
```

### Environment files

Copy the example env files and update them for your local setup:

```bash
cd backend
cp .env.example .env

cd ../frontend
cp .env.example .env
```

Make sure the frontend API URL points to your backend.

## Running locally

Start the backend:

```bash
npm run dev --workspace backend
```

Start the frontend in a second terminal:

```bash
npm run dev --workspace frontend
```

## Building

Build the backend:

```bash
npm run build --workspace backend
```

Build the frontend:

```bash
npm run build --workspace frontend
```

## Notes

- The project is intentionally kept basic and easy to follow
- The backend uses a small service/repository structure
- The frontend uses simple React components and shared form validation
