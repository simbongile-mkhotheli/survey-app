## Survey Application

A full-stack web application for collecting and analyzing survey responses, built with modern technologies and best practices.

## 🚀 Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for blazing‑fast development
- **React Router** for navigation
- **React Hook Form** for form management
- **Zod** for runtime type validation
- **Zustand** for lightweight global state (survey results & theme)
- **CSS Modules** for scoped styling
- **Axios** for API communication

### Backend

- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **Zod** for request validation
- **Express Async Errors** for centralized error handling

## ✨ Features

- **End-to-End Type Safety**: Fully typed frontend and backend with TypeScript
- **Form Validation**: Client- and server-side validation using Zod schemas
- **Responsive Design**: Mobile-friendly UI built with CSS Modules
- **Error Handling**: Robust error handling on both client and server
- **Real-Time Analytics**: Aggregate and display survey results dynamically
- **API Documentation**: Clear API endpoints with request/response schemas
- **Code Quality**: ESLint and Prettier configurations
- **Git Hooks**: Husky and lint-staged enforce pre-commit checks

## 🛠️ Project Structure

```
survey-app/
├── frontend/
│   ├── src/
│   │   ├── components/      # UI (SurveyForm, Results, Nav…)  
│   │   ├── services/        # API wrappers (submitSurvey, fetchResults)  
│   │   ├── store/           # Zustand hooks  
│   │   ├── validation/      # Shared Zod schemas  
│   │   └── App.tsx          # Routes & root component  
│   ├── tsconfig.app.json  
│   └── vite.config.ts       # dev‑proxy for `/api` → localhost:4000  
└── backend/
    ├── prisma/              # schema.prisma & migrations  
    ├── src/
    │   ├── controllers/     # Express route handlers  
    │   ├── validation/      # Zod schemas  
    │   ├── middleware/      # errorHandler, rateLimit, CORS setup  
    │   └── server.ts        # Express app setup  
    └── tsconfig.json  
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (local or managed)
- npm 

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/survey-app.git
   cd survey-app
   ```

2. **Configure the database**

   - Install PostgreSQL and create a database:

     ```bash
     createdb survey_db
     ```

   - Copy and edit environment variables:

     ```bash
     cp backend/.env.example backend/.env
     ```

   - **`.env.example` contents**:

     ```env
     DATABASE_URL="postgresql://your_username:your_password@localhost:5432/survey_db"
     ```

   - Edit `backend/.env` and replace placeholder values with your own.
       ```env
     DATABASE_URL="postgresql://your_username:your_password@localhost:5432/survey_db"
     ```
       cp frontend/.env.example frontend/.env

3. **Install dependencies**

   ```bash
   # Frontend
   cd frontend 
   npm install

   # Backend
   cd ../backend
   npm install
   ```

4. **Run database migrations**

   - The `backend/prisma/` directory includes **`schema.prisma`** and \*\*migration
   - To apply migrations to your database, run:

     ```bash
     cd backend
     npx prisma migrate dev --name init
     ```

5. **Start development servers**

   - Frontend ([http://localhost:3000](http://localhost:3000)):

     ```bash
     cd frontend
     npm run dev
     ```

   - Backend ([http://localhost:4000](http://localhost:4000)):

     ```bash
     cd backend
     npm run dev
     ```

## 📝 API Endpoints

### `POST /api/survey`

- **Description**: Submit a new survey response
- **Body**: JSON object matching the survey response schema
- **Response**: Created survey entry with ID

### `GET /api/results`

- **Description**: Fetch aggregated survey results
- **Query Parameters**:

  - `detailLevel` (optional): `summary` or `detailed`

    - `summary`: returns overall statistics (e.g., totals, percentages)
    - `detailed`: includes per-response breakdown or question-level stats

- **Response**: JSON containing survey analytics

## 📈 Code Quality & Security

- **ESLint** and **Prettier** for consistent code style
- **Husky** pre-commit hooks for linting and type checking
- **Zod** schemas to protect against invalid input
- **Prisma** prevents SQL injection
- CORS configured for cross-origin requests
- Rate limiting on API endpoints

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m "feat: description"`)
4. Push to the branch (`git push origin feature-name`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
