# Lifestyle Survey App - Enterprise-Grade Full-Stack Application

A professional survey platform demonstrating industry best practices in enterprise software development, including SOLID principles, comprehensive testing, security hardening, and production-ready DevOps practices.

## 🎯 Project Overview

This is a **full-stack monorepo** with React frontend, Node.js/Express backend, and PostgreSQL database. The application implements:

- **Clean Architecture**: Layered SOLID-compliant design with dependency injection
- **Comprehensive Testing**: 336 unit tests (89 frontend + 247 backend) with 95%+ code coverage
- **Security-First**: OWASP compliance, input sanitization, SQL injection prevention
- **Production-Ready**: Health checks, monitoring, CI/CD pipeline
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

- **GitHub Actions** for CI/CD pipeline
- **Kubernetes** health check endpoints
- **Health monitoring** with database connectivity checks

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
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

- **Frontend**: 89 tests covering UI components, form validation, state management, store persistence
- **Backend**: 247 tests covering services, repositories, controllers, middleware, validation schemas
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
│   └── workflows/               # GitHub Actions CI/CD
│
├── COMMIT_STANDARDS.md          # Conventional Commits guide
├── CONTRIBUTING.md              # Developer guidelines
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

The API provides two main endpoints for survey management:

- **POST /api/survey**: Submit survey responses with personal information and ratings
- **GET /api/results**: Retrieve aggregated analytics and statistics

**Field Requirements**:

- `firstName`, `lastName`: 2-100 characters
- `email`: Valid RFC 5322 format, ≤255 characters
- `contactNumber`: Format `+?[0-9]{10,15}` (optional country code)
- `dateOfBirth`: ISO 8601 format (YYYY-MM-DD), age 5-120 years
- `foods`: Array of 1-10 items (pizza, pasta, papAndWors)
- `ratingMovies`, `ratingRadio`, `ratingEatOut`, `ratingTV`: String values "1"-"5"

**See [backend/docs/API_DOCUMENTATION.md](backend/docs/API_DOCUMENTATION.md) for:**

- Complete API reference with field constraints
- Live interactive testing via Swagger UI at `/api-docs`
- Postman collection for pre-configured requests
- Error response formats and status codes

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

## 🚦 CI/CD Pipeline

The project uses **GitHub Actions** for:

1. **Code Quality**: ESLint, TypeScript, Prettier
2. **Testing**: Full test suite with coverage reporting
3. **Security Scanning**: Dependency audits, SAST
4. **Deployment**: Automatic deployment on main branch

See [`.github/workflows`](.github/workflows) for pipeline configuration.

## 📊 Test Coverage

### Frontend Tests (89 tests)

- ✅ Component rendering and interaction (SurveyForm, Results, responses)
- ✅ Form validation with Zod schemas
- ✅ State management (Zustand store with devtools)
- ✅ API service integration
- ✅ Utility functions (date formatting, form utilities, response handling)
- ✅ Error handling and edge cases

### Backend Tests (247 tests)

- ✅ Service business logic (with mocked repository dependencies)
- ✅ Repository data access (SQLite integration tests)
- ✅ Controller HTTP request/response handling
- ✅ Middleware (validation, error handling, logging, metrics, rate limiting)
- ✅ Error scenarios and edge cases
- ✅ Validation schemas (Zod with sanitization transformations)
- ✅ Configuration validation
- ✅ Security features (CORS, HPP, sanitization, rate limiting)

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

## 🎨 UI/UX Improvements Planned:

### Styling Enhancements

- **Goal**: Beef up the styling to make the app sleeker and more polished
- **Status**: In planning
- **Areas of Focus**:
  - Typography refinements
  - Color scheme enhancements
  - Spacing and padding optimizations
  - Border radius and subtle shadows
  - Hover and interaction states
  - Transition smoothness
  - Component-level styling consistency
  - Animation polish

## 🆘 Troubleshooting

### Production: Survey Submission Timeout (Vercel)

**Issue**: When the app loads for the first time in production and a user submits a completed survey, a timeout error occurs (exceeds 5000ms).

**Possible Cause**: This appears to be a Vercel cold start or serverless function initialization quirk.

**Workaround**:

- Retry the survey submission
- Ensure backend service has warmed up before submitting
- Consider implementing client-side retry logic with exponential backoff

**Portfolio Note**: This is a known limitation when deploying to serverless environments.
For production use, consider a dedicated server or pre-warming strategies.

## 🙏 Acknowledgments

Built with industry best practices from:

- Angular style guide (dependency injection)
- React documentation (hooks, memo, suspense)
- Node.js best practices (error handling, logging)
- OWASP Top 10 (security hardening)
- Conventional Commits (commit standards)
- Semantic Versioning (release management)

## 📄 License

This project is licensed under the MIT License.
See the LICENSE file for details.

## 👥 Team

- **Maintainer**: Simbongile Mkhotheli
- **Contributors**: See [CONTRIBUTING.md](CONTRIBUTING.md)
