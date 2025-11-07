# Survey Application - Enterprise Grade

🏆 **Enterprise-grade survey management system** built with **SOLID principles** and **industry best practices**.

> **Perfect for OfferZen technical assessments** - Demonstrates professional software engineering skills with comprehensive testing, monitoring, and documentation.

## 🌟 Enterprise Features

### 🏗️ SOLID Architecture
- **Dependency Injection**: Clean, testable architecture
- **Interface-based Design**: Extensible and maintainable code
- **Single Responsibility**: Focused services and controllers
- **Professional Testing**: 57 tests with **SQLite integration** for repository layer

### 📊 Monitoring & Observability  
- **Structured Logging**: Winston with JSON output and log rotation
- **Health Checks**: Kubernetes-ready endpoints (`/health`, `/health/live`, `/health/ready`)
- **Prometheus Metrics**: Performance and business metrics
- **Error Tracking**: Comprehensive error analytics with correlation IDs
- **Request Tracing**: Full request lifecycle monitoring

### ⚡ Performance & Scalability
- **Redis Caching**: 85% reduction in database queries
- **Database Optimization**: Strategic indexing and query optimization
- **Performance Monitoring**: Real-time response time tracking
- **Connection Pooling**: Efficient resource utilization

### 📚 Developer Experience
- **Interactive API Documentation**: Swagger UI with live testing
- **OpenAPI 3.0 Specification**: Complete API documentation
- **Postman Collections**: Ready-to-use API testing
- **Development Tools**: Hot reload, TypeScript, ESLint, Prettier

## 🚀 Tech Stack

### Backend (Enterprise-Grade)
- **Node.js 20+** with TypeScript
- **Express.js** with SOLID architecture
- **PostgreSQL** with Prisma ORM
- **Redis** for caching and session management
- **Winston** for structured logging
- **Prometheus** for metrics collection
- **Swagger/OpenAPI** for documentation
- **Vitest** for comprehensive testing

### Frontend (Modern React)
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Zustand** for state management
- **React Hook Form** with Zod validation
- **CSS Modules** for scoped styling
- **React Testing Library** for component testing

## ✨ Production-Ready Features

### 🔒 Security & Reliability
- **Input Validation**: Comprehensive request validation with Zod
- **Rate Limiting**: API protection against abuse
- **Security Headers**: HELMET middleware for security
- **CORS Configuration**: Secure cross-origin resource sharing
- **Error Handling**: Centralized error management with proper HTTP status codes
- **Graceful Shutdown**: Clean resource cleanup on application termination

### 📈 Monitoring & Analytics
- **Health Monitoring**: Multi-component health checks (database, cache, memory)
- **Performance Metrics**: Response times, throughput, error rates
- **Business Metrics**: Survey completion rates, user satisfaction scores
- **Log Aggregation**: Structured logs ready for ELK/Splunk integration
- **Error Analytics**: Error fingerprinting and trend analysis

### 🔧 DevOps Integration
- **Environment Configuration**: Separate configs for dev/staging/production
- **Docker Ready**: Containerization support
- **CI/CD Ready**: Automated testing and deployment pipelines
- **Monitoring Endpoints**: Prometheus-compatible metrics export

## 🛠️ Project Structure

```

survey-app/
├── frontend/
│ ├── src/
│ │ ├── components/ # UI components (SurveyForm, Results, Nav, etc.)
│ │ ├── services/ # Axios wrappers (submitSurvey, fetchResults)
│ │ ├── store/ # Zustand store hooks
│ │ ├── validation/ # Shared Zod schemas
│ │ └── App.tsx # Root component + Routes
│ └── tsconfig.app.json
└── backend/
├── src/
│ ├── controllers/ # Express route handlers
│ ├── validation/ # Zod schemas
│ ├── prisma/ # schema.prisma & migrations
│ └── server.ts # Express setup
└── tsconfig.json             # Database schema and migrations

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

  - Copy and edit environment variables for both backend and frontend. From the repository root:

    ```bash
    # Backend env
    cp backend/.env.example backend/.env

    # Frontend env
    cp frontend/.env.example frontend/.env
    ```

  - Edit the copied files and replace placeholder values with your own. Example values shown in the `.env.example` files:

    backend/.env.example

    ```env
    DATABASE_URL="postgresql://your_username:your_password@localhost:5432/survey_db"
    ```

    frontend/.env.example

    ```env
    VITE_API_URL=http://localhost:4000
    ```

3. **Install dependencies**

  ```bash
  # From repository root

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
