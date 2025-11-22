# Survey App - Enterprise-Grade Full-Stack Application

A professional survey platform demonstrating industry best practices in enterprise software development, including SOLID principles, comprehensive testing, security hardening, and production-ready DevOps practices.

## 🎯 Project Overview

This is a **full-stack monorepo** with React frontend, Node.js/Express backend, and PostgreSQL database. The application implements:

- **Clean Architecture**: Layered SOLID-compliant design with dependency injection
- **Comprehensive Testing**: 217 unit tests with 95%+ code coverage
- **Security-First**: OWASP compliance, input sanitization, SQL injection prevention
- **Production-Ready**: Docker containerization, health checks, monitoring, CI/CD
- **Professional Code Quality**: ESLint zero-warnings, TypeScript strict mode, Prettier formatting
- **Dynamic Test Data**: Faker.js for realistic test scenarios (no hardcoded values)
- **Industry Standards**: Conventional Commits, semantic versioning, professional documentation

## 📋 Tech Stack

### Frontend

- **React 18** with Vite (lightning-fast HMR)
- **Zustand** for state management with devtools
- **TypeScript** with strict mode enabled
- **Zod** for runtime schema validation
- **Vitest + React Testing Library** for comprehensive testing

### Backend

- **Node.js** with Express.js framework
- **TypeScript** with strict type checking
- **Prisma ORM** for type-safe database access
- **PostgreSQL** for relational data
- **Redis** for distributed caching (optional)
- **Winston** for structured logging
- **Prometheus** for metrics collection

### DevOps & Infrastructure

- **Docker** with multi-stage builds for optimization
- **Docker Compose** for local development
- **GitHub Actions** for CI/CD pipeline
- **Kubernetes** health check endpoints
- **Health monitoring** with database connectivity checks

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 14+ (or use Docker)
- Git

### Local Development Setup

#### 1. Clone and Install

```bash
git clone https://github.com/simbongile-mkhotheli/survey-app.git
cd survey-app
npm install
```

#### 2. Configure Environment Variables

```bash
# Backend
cd backend
cp .env.example .env.local
# Edit with your database credentials

# Frontend
cd ../frontend
cp .env.example .env.local
```

#### 3. Start Services

```bash
# Option A: Docker Compose (recommended)
docker-compose up

# Option B: Manual setup
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Access the application at `http://localhost:3000`

## 🧪 Testing & Quality

### Run All Tests

```bash
# Frontend tests
cd frontend && npm run test

# Backend tests
cd backend && npm run test

# With coverage report
npm run test:coverage
```

### Test Statistics

- **Frontend**: 41 tests covering UI components, validation, state management
- **Backend**: 176 tests covering services, repositories, middleware, controllers
- **Coverage**: ≥95% on all metrics (statements, branches, functions, lines)
- **Test Data**: 100% dynamic via Faker.js (no hardcoded values)

### Code Quality Checks

```bash
# Type checking
npm run typecheck

# ESLint validation (zero warnings policy)
npm run lint

# Format check
npm run format:check

# All checks (local pre-commit validation)
npm run check:all
```

## 📁 Project Structure

```
├── backend/                      # Express.js server
│   ├── src/
│   │   ├── controllers/         # HTTP request handlers
│   │   ├── services/            # Business logic
│   │   ├── repositories/        # Data access layer
│   │   ├── middleware/          # Express middleware
│   │   ├── config/              # Configuration
│   │   ├── errors/              # Custom error classes
│   │   ├── interfaces/          # TypeScript interfaces
│   │   ├── test/                # Test files & utilities
│   │   └── server.ts            # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Database migrations
│   └── package.json
│
├── frontend/                     # React + Vite application
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API integration
│   │   ├── store/               # Zustand state
│   │   ├── test/                # Test files
│   │   ├── validation.ts        # Zod schemas
│   │   └── App.tsx              # Root component
│   └── package.json
│
├── shared/                       # Shared validation schemas
│   └── validation.ts            # Common Zod schemas
│
├── .github/
│   ├── copilot-instructions.md  # AI development guidelines
│   └── workflows/               # GitHub Actions CI/CD
│
├── COMMIT_STANDARDS.md          # Conventional Commits guide
├── CONTRIBUTING.md              # Developer guidelines
├── docker-compose.yml           # Local development stack
└── README.md                     # This file
```

## 🏗️ Architecture

### Backend Layered Architecture

```
HTTP Request
    ↓
Controller (HTTP handling)
    ↓
Service (Business logic)
    ↓
Repository (Data access)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
```

**Key Principles:**

- **Dependency Injection**: Container singleton manages all dependencies
- **SOLID Compliance**: Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion
- **Error Handling**: Centralized error middleware with custom error hierarchy
- **Validation**: Zod schemas at middleware layer (validateBody)
- **Logging**: Structured logging with Winston (console + rotating files)
- **Caching**: Multi-layer (Redis + NodeCache) with cache invalidation

### Frontend Component Architecture

```
App
├── SurveyForm          # Form input with validation
└── Results             # Survey results aggregation

Store (Zustand)
├── Survey data
├── Results data
├── UI state
└── Settings (dark mode, language)
```

## 🔐 Security

The application implements **OWASP Top 10** protections:

- ✅ **Input Validation**: Zod schemas + sanitization middleware
- ✅ **SQL Injection**: Prisma parameterized queries
- ✅ **XSS Prevention**: HTML escaping + CSP headers
- ✅ **CSRF Protection**: Session secrets + SameSite cookies
- ✅ **Rate Limiting**: Redis-backed with IP tracking
- ✅ **HTTPS**: Automatic redirect in production
- ✅ **Security Headers**: Helmet + custom headers
- ✅ **Error Handling**: Generic messages (no stack traces to clients)

## 📊 Monitoring & Observability

### Health Checks

```bash
# Liveness probe
GET /health/live

# Readiness probe (checks database)
GET /health/ready

# Full health check
GET /health
```

### Metrics (Prometheus format)

```bash
GET /metrics
```

Tracks:

- HTTP request metrics
- Database query performance
- Cache hit ratios
- Business metrics (surveys created, etc.)

### Logging

- **Console**: Development environment (colorized)
- **Rotating Files**: Production environment (JSON format)
- **Request Tracing**: X-Request-ID header propagation
- **Error Tracking**: Fingerprinting + severity classification

## 📚 API Documentation

### Survey Submission

```http
POST /api/survey
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "contactNumber": "+1234567890",
  "dateOfBirth": "1999-01-15",
  "foods": ["pizza", "pasta"],
  "ratingMovies": 5,
  "ratingRadio": 3,
  "ratingEatOut": 4,
  "ratingTV": 2
}

Response: 201 Created
{ "id": 123 }
```

### Results Retrieval

```http
GET /api/results

Response: 200 OK
{
  "totalCount": 100,
  "age": { "avg": 28.5, "min": 18, "max": 65 },
  "foodPercentages": { "pizza": 45, "pasta": 35, "papAndWors": 20 },
  "avgRatings": { "movies": 4.2, "radio": 3.1, "eatOut": 4.8, "tv": 3.5 }
}
```

**See [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for complete API reference with Swagger/OpenAPI spec.**

## 🔄 Development Workflow

### Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make changes** following [CONTRIBUTING.md](CONTRIBUTING.md)

3. **Run quality checks**

   ```bash
   npm run check:all  # Lint, typecheck, test, format
   ```

4. **Commit with Conventional Commits**

   ```bash
   git commit -m "feat(scope): concise description"
   ```

   See [COMMIT_STANDARDS.md](COMMIT_STANDARDS.md) for guidelines.

5. **Push and create Pull Request**
   ```bash
   git push origin feat/your-feature-name
   ```

### Pre-commit Hooks

The repository uses **husky** to enforce:

- ✅ ESLint passes (zero warnings)
- ✅ Prettier formatting applied
- ✅ TypeScript compilation succeeds
- ✅ All tests pass
- ✅ Conventional Commit format

## 📈 Performance Optimizations

- **Frontend**: Code splitting, lazy loading, memoization (React.memo, useMemo)
- **Backend**: Database indexing, query optimization, connection pooling
- **Caching**: Redis for distributed caching (5-minute TTL)
- **Compression**: gzip compression with size threshold

## 🐳 Docker Deployment

### Build Production Images

```bash
docker-compose -f docker-compose.prod.yml build
```

### Run Production Stack

```bash
docker-compose -f docker-compose.prod.yml up
```

### Environment Variables (Production)

```bash
# Backend
DATABASE_URL=postgresql://user:pass@host:5432/survey_prod
REDIS_HOST=redis.example.com
REDIS_ENABLED=true
LOG_LEVEL=info
SECURITY_HTTPS_REDIRECT=true

# Frontend
VITE_API_URL=https://api.example.com
```

## 🚦 CI/CD Pipeline

The project uses **GitHub Actions** for:

1. **Code Quality**: ESLint, TypeScript, Prettier
2. **Testing**: Full test suite with coverage reporting
3. **Build Validation**: Docker image builds
4. **Security Scanning**: Dependency audits, SAST
5. **Deployment**: Automatic deployment on main branch

See [`.github/workflows`](.github/workflows) for pipeline configuration.

## 📊 Test Coverage

### Frontend Tests (41 tests)

- ✅ Component rendering and interaction
- ✅ Form validation and submission
- ✅ State management (Zustand store)
- ✅ API integration
- ✅ Error handling

### Backend Tests (176 tests)

- ✅ Service business logic (mocked repositories)
- ✅ Repository data access (SQLite integration)
- ✅ Controller HTTP handling
- ✅ Middleware functionality
- ✅ Error scenarios and edge cases
- ✅ Validation schemas

**All test data generated dynamically via Faker.js - zero hardcoded values.**

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup
- Coding standards
- PR review process
- Issue reporting guidelines

## 📝 Code Style & Standards

### Enforced by CI/CD

- **ESLint**: Zero warnings policy
- **Prettier**: Auto-formatting on commit
- **TypeScript**: Strict mode (`noImplicitAny: true`, etc.)
- **Conventional Commits**: Format validation on commits
- **Test Coverage**: ≥95% required

### Path Aliases (No Relative Imports)

```typescript
// ✅ CORRECT
import { SurveyService } from '@/services/survey.service';
import { useAppStore } from '@/store/useSurveyStore';

// ❌ WRONG
import { SurveyService } from '../../../services/survey.service';
```

## 📚 Documentation Files

- [COMMIT_STANDARDS.md](COMMIT_STANDARDS.md) - Conventional Commits guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines
- [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) - Complete API reference
- [docs/README.md](docs/README.md) - Architecture deep-dive
- [.github/copilot-instructions.md](.github/copilot-instructions.md) - AI development guidelines

## 🆘 Troubleshooting

### Database Connection Failed

```bash
# Ensure PostgreSQL is running
docker-compose ps

# Check connection string
echo $DATABASE_URL

# Run migrations
npx prisma migrate dev
```

### Tests Failing

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Resync database (test environment)
npm run test:reset-db
```

### Port Already in Use

```bash
# Change port via environment variable
PORT=5001 npm run dev
```

## 📄 License

[Add your license here]

## 👥 Team

- **Maintainer**: Simbongile Mkhotheli
- **Contributors**: See [CONTRIBUTING.md](CONTRIBUTING.md)

## 🙏 Acknowledgments

Built with industry best practices from:

- Angular style guide (dependency injection)
- React documentation (hooks, memo, suspense)
- Node.js best practices (error handling, logging)
- OWASP Top 10 (security hardening)
- Conventional Commits (commit standards)
- Semantic Versioning (release management)
