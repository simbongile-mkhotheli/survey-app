# Copilot Instructions for Survey App

This codebase is an enterprise-grade full-stack survey application demonstrating SOLID principles, professional testing, monitoring, and DevOps practices. AI agents should understand the architecture, key patterns, and development workflows below.

## Architecture Overview

**Monorepo Structure**: `backend/` (Node.js/Express/TypeScript), `frontend/` (React/Vite), `shared/` (validation schemas)

**Backend Dependency Injection (DIP)**:

- `Container` singleton in `src/container.ts` manages all service/repository instances
- Layered architecture: Controllers → Services → Repositories → Prisma ORM
- All classes implement interfaces in `src/interfaces/` (ISurveyService, ISurveyRepository, IResultsService, IResultsRepository)
- Services delegate data access to repositories; repositories handle Prisma mapping with explicit `mapToDomain()` type conversions
- Example: `handleCreateSurvey` (controller) → `SurveyService.createSurvey()` → `SurveyRepository.create()` → Prisma

**Data Flow**:

- Frontend form (SurveyFormValues with string ratings) → Zod SurveyFormSchema validation → formToPayload() conversion → Axios POST to `/api/survey`
- Backend receives → validateBody middleware (SurveyPayloadSchema with number ratings) → Controller → Service → Repository → Prisma → PostgreSQL
- Cache layer: ResultsRepository checks Redis/NodeCache before querying; services call `invalidateCache()` after mutations

**These standards are ENFORCED for all code changes:**

### Single Responsibility Principle (SRP)

- **Controllers**: Handle HTTP requests/responses only; delegate ALL business logic to services
- **Services**: Contain business logic only; delegate ALL data access to repositories
- **Repositories**: Handle data access only; map Prisma models to domain types with `mapToDomain()`
- **Validation**: Happens at middleware layer (`validateBody`), not in services

### Dependency Inversion Principle (DIP)

- **All classes must implement their interface** (e.g., `SurveyService implements ISurveyService`)
- **Constructor injection required** - no direct instantiation of dependencies
- **Use Container singleton** (`Container.getInstance()`) to resolve dependencies
- **Example**: `constructor(private repo: ISurveyRepository)` - inject interface, not implementation

### Type Safety & Consistency

- **All API responses must use mapped domain types** (never pass Prisma models directly)
- **Always call `mapToDomain()`** when converting from Prisma to response
- **All functions must have explicit return types** (no implicit `any`)
- **All mutable operations must return typed objects** (not void)

### Error Handling (Non-Negotiable)

- **All async functions in controllers must use try/catch**
- **All catch blocks must use `next(err)`** (delegate to error middleware, never send response)
- **All services must throw custom errors** (ValidationError, NotFoundError, DatabaseError)
- **All errors must be logged** with `logWithContext.error(message, error, metadata)`
- **Never swallow errors** - always log and re-throw or delegate

### Logging & Observability (Non-Negotiable)

- **All service methods must log with context**: `logWithContext.info(operation, { duration, metadata })`
- **All errors must be logged**: `logWithContext.error(message, error as Error, { operation, input })`
- **All operations must include metadata**: operation name, duration, IDs, relevant fields
- **Request ID must be propagated** through all logs via `requestContext`

### Cache Invalidation (Non-Negotiable)

- **All mutations (create, update, delete) must call `invalidateCache()`**
- **Cache invalidation MUST happen in the service** after successful repository operation
- **Example**: After `surveyRepository.create()`, immediately call `resultsRepository.invalidateCache()`
- **Failure to invalidate = data staleness bug = code review failure**

### Testing Requirements

**MANDATORY**: All code additions must include tests. No untested code merged.

#### **Test Structure (By Layer)**

**Services** (`src/test/unit/services/*.test.ts`):

- ✅ Mock all repository dependencies via interface
- ✅ Test business logic in isolation
- ✅ Cover success and error paths
- ✅ Verify cache invalidation calls
- ✅ Test parameter validation
- Example: `ResultsService.getResults()` → mock repository → assert aggregation logic

**Repositories** (`src/test/unit/repositories/*.test.ts`):

- ✅ Integration tests against SQLite test database
- ✅ Test `mapToDomain()` conversions
- ✅ Verify cache key usage
- ✅ Test query parameters and filtering
- Example: `SurveyRepository.findById()` → query DB → verify mapping

**Controllers** (`src/test/unit/controllers/*.test.ts`):

- ✅ Mock services via interface
- ✅ Test HTTP request/response handling
- ✅ Verify error delegation to middleware (no catch-block responses)
- ✅ Test all status codes (200, 400, 404, 500)
- Example: POST /api/survey → validate input → call service → return 201

**Middleware** (`src/test/unit/middleware/*.test.ts`):

- ✅ Test error handling logic
- ✅ Verify logging behavior
- ✅ Test request/response transformations
- ✅ Test security headers and filtering
- Example: ErrorHandler → AppError → 400/500 response with proper format

**Utilities** (`src/test/unit/utils/*.test.ts`):

- ✅ Pure function testing
- ✅ Edge cases and boundary conditions
- ✅ Type safety verification
- Example: `findFoodCount()` → case variations → whitespace normalization

**Configuration** (`src/test/unit/config/*.test.ts`):

- ✅ Environment variable validation
- ✅ Default values verification
- ✅ Configuration object structure
- Example: `env.test.ts` → required vars → JWT_SECRET length validation

#### **Test Patterns (Required)**

**Mocking Repositories** (Service tests):

```typescript
const mockRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  // ... other methods
} as Partial<ISurveyRepository>;

const service = new SurveyService(mockRepository);
vi.mocked(mockRepository.create).mockResolvedValue(data);
```

**Arrange-Act-Assert Pattern** (All tests):

```typescript
it('should create a survey successfully', async () => {
  // ARRANGE - Setup test data and mocks
  const input = createMockSurveyInput();
  vi.mocked(mockRepository.create).mockResolvedValue(mockResponse);

  // ACT - Execute the code under test
  const result = await service.createSurvey(input);

  // ASSERT - Verify the results
  expect(mockRepository.create).toHaveBeenCalledWith(input);
  expect(result).toEqual(mockResponse);
});
```

**Testing Error Paths** (All layers):

```typescript
it('should handle database errors gracefully', async () => {
  // Error simulation
  vi.mocked(mockRepository.create).mockRejectedValue(
    new DatabaseError('Connection failed', 'create'),
  );

  // Error assertion
  await expect(service.createSurvey(input)).rejects.toThrow(DatabaseError);
  expect(logWithContext.error).toHaveBeenCalled();
});
```

#### **Coverage Requirements**

- **Backend**: ≥95% required on CI (`npm run test:coverage`)
- **Statement Coverage**: Every code path executed
- **Branch Coverage**: All if/else paths tested
- **Function Coverage**: All functions called at least once
- **Line Coverage**: No dead code
- **Failure**: Coverage below 95% = PR rejected

#### **Test Execution**

```bash
# Run all tests once
npm run test

# Watch mode (development)
npm run test:watch

# Coverage report
npm run test:coverage

# UI dashboard
npm run test:ui
```

#### **Test File Naming**

- Unit tests: `src/test/unit/{layer}/{feature}.test.ts`
- Security tests: `src/test/security-*.test.ts`
- Integration tests: `src/test/integration/*.test.ts` (future)

#### **Mock Pattern Rules**

- ✅ **Always use interfaces** - `ISurveyRepository`, `IResultsService`
- ✅ **Never instantiate real dependencies** - Mock them
- ✅ **Use `vi.fn()` for spy verification** - Assert called with correct params
- ✅ **Reset mocks between tests** - Prevent test pollution
- ✅ **Use test helpers** - `createMockSurveyInput()` from `test/utils/test-helpers.ts`
- ❌ **NEVER**: Spy on real database calls in unit tests
- ❌ **NEVER**: Test multiple services in one test
- ❌ **NEVER**: Leave console.log() in test output

#### **Dynamic Test Data Rules (Non-Negotiable)**

**ALL test data must be dynamically generated using Faker.js - NO hardcoded values allowed**

**Backend Test Data** (`backend/src/test/utils/test-helpers.ts`):

- Use `@faker-js/faker` for all test data generation
- `createMockSurveyInput()` - generates complete survey payloads with valid field values
- `createMockEmail()`, `createMockPhone()`, `createMockDateOfBirth()`, `createMockRating()`, etc. - field-specific generators
- All generated data must pass validation schemas (SurveyPayloadSchema for backend)
- Override mechanism: `createMockSurveyInput({ email: 'custom@test.com' })` for specific test scenarios
- Never use hardcoded test data like `{ firstName: 'John', email: 'john@example.com' }`

**Frontend Test Data** (`frontend/src/test/utils/test-helpers.ts`):

- Use `@faker-js/faker` for all form and validation test data
- `createMockSurveyFormData()` - generates complete form values with valid strings for ratings
- Individual generators: `createMockFirstName()`, `createMockEmail()`, `createMockPhone()`, `createMockDateOfBirth()`, `createMockFoodSelection()`, `createMockRating()`
- All generated data must pass SurveyFormSchema validation (Zod schema with string ratings)
- Use `beforeEach()` hooks to generate fresh data for each test: `validFormData = createMockSurveyFormData()`
- Override support for specific test assertions: `createMockSurveyFormData({ foods: [] })` to test empty food selection

**Data Constraints**:

- **Phone numbers**: Must match regex `/^\+?\d{10,15}$/` (11+ digits with optional + prefix)
- **Dates**: Generate within valid age range (5-120 years); use 25-40 year age range for safety
- **Emails**: Use `faker.internet.email()`, trim to ≤255 chars, lowercase
- **Ratings**: String values '1'-'5' for frontend, number values 1-5 for backend
- **Names**: Substring to ≤100 chars
- **Foods**: Array of 1-10 strings, ≤50 chars each

**Enforcement**:

- ❌ **NEVER**: Use hardcoded test values like `'John'`, `'john@example.com'`, `'+1234567890'`
- ❌ **NEVER**: Use static constants for test data across multiple tests
- ❌ **NEVER**: Skip calling test helpers and manually create mock objects
- ✅ **ALWAYS**: Use test helpers from `test/utils/test-helpers.ts`
- ✅ **ALWAYS**: Let Faker.js generate unique data for each test run
- ✅ **ALWAYS**: Ensure generated data passes the validation schema being tested

**Example - Backend (Correct)**:

```typescript
import { createMockSurveyInput } from '../../test/utils/test-helpers';

it('should create a survey successfully', async () => {
  const input = createMockSurveyInput(); // Dynamic data
  vi.mocked(mockRepository.create).mockResolvedValue(mockSurvey);
  const result = await service.createSurvey(input);
  expect(result).toBeDefined();
});

it('should handle invalid phone numbers', async () => {
  // Override only the field being tested
  const input = createMockSurveyInput({ contactNumber: 'invalid' });
  await expect(service.createSurvey(input)).rejects.toThrow(ValidationError);
});
```

**Example - Frontend (Correct)**:

```typescript
import { createMockSurveyFormData, createMockFirstName } from '../../test/utils/test-helpers';

describe('SurveyForm', () => {
  let validFormData: SurveyFormValues;

  beforeEach(() => {
    validFormData = createMockSurveyFormData();  // Fresh data each test
  });

  it('should render form with valid data', () => {
    render(<SurveyForm initialData={validFormData} />);
    expect(screen.getByDisplayValue(validFormData.firstName)).toBeInTheDocument();
  });

  it('should require at least one food selection', async () => {
    const emptyFoods = createMockSurveyFormData({ foods: [] });
    render(<SurveyForm initialData={emptyFoods} />);
    // ... assertions
  });
});
```

#### **When Tests Fail**

1. **Type Error**: Run `npm run typecheck` - fix TypeScript issues
2. **Assertion Failed**: Read error message - verify expected vs actual
3. **Coverage Drop**: Add tests for uncovered lines (shown in coverage report)
4. **CI Failure**: Run locally first: `npm run test && npm run lint && npm run typecheck`
5. **Flaky Tests**: Increase timeout, avoid time-dependent logic, use `vi.useFakeTimers()`

### Documentation (Non-Negotiable)

- **All public functions must have JSDoc comments** with `@param`, `@returns`, `@throws`
- **All complex logic must have inline comments** explaining the "why"
- **All routes must have Swagger JSDoc** (@swagger tags with examples)
- **All API responses must document schema** with type definitions

### Code Style (Enforced by CI)

- **ESLint**: Zero warnings allowed - any violation fails PR
- **Prettier**: Auto-formatted - checked on every commit
- **TypeScript**: `npm run typecheck` must pass - no type errors allowed
- **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces, UPPER_CASE for constants

### Import Path Aliases (Non-Negotiable)

**ALWAYS use path aliases** - Never use relative imports like `../../` (unless absolutely necessary for shared packages)

**Backend Aliases** (`@/*`, `@/controllers/*`, `@/services/*`, etc.):

```typescript
// ✅ CORRECT - Use path aliases
import { SurveyService } from '@/services/survey.service';
import { SurveyRepository } from '@/repositories/survey.repository';
import { ValidationError } from '@/errors/AppError';
import { logWithContext } from '@/config/logger';
import type { ISurveyRepository } from '@/interfaces/repository.interface';
import { SurveyPayloadSchema } from '@shared/validation';

// ❌ WRONG - Never use relative imports
import { SurveyService } from '../../../services/survey.service';
import { ValidationError } from '../../../errors/AppError';
```

**Frontend Aliases** (`@/*`, `@/components/*`, `@/services/*`, etc.):

```typescript
// ✅ CORRECT - Use path aliases
import { SurveyForm } from '@/components/Survey/SurveyForm';
import { useSurveyStore } from '@/store/useSurveyStore';
import { createSurvey } from '@/services/api';
import type { SurveyFormValues } from '@/validation';
import { SurveySchema } from '@shared-root/validation';

// ❌ WRONG - Never use relative imports
import { SurveyForm } from '../../../components/Survey/SurveyForm';
import { useSurveyStore } from '../../../store/useSurveyStore';
```

**Enforcement**:

- ✅ **ALWAYS**: Use configured path aliases from `tsconfig.json`
- ✅ **ALWAYS**: Use `@/*` for top-level src imports
- ✅ **ALWAYS**: Use `@shared/*` or `@shared-root/*` for shared package imports
- ✅ **ALWAYS**: Update imports when moving files to maintain alias paths
- ❌ **NEVER**: Use relative imports like `../../module` in new code
- ❌ **NEVER**: Use `require()` instead of ES6 imports
- ❌ **NEVER**: Mix relative and alias imports in same file

## Key Patterns & Conventions

### Validation Layer

- **Dual schemas in `shared/validation.ts`**:
  - `SurveyFormSchema`: Frontend form inputs with **string ratings** (e.g., `ratingMovies: "5"`)
  - `SurveyPayloadSchema`: Backend API payload with **number ratings** (e.g., `ratingMovies: 5`)
  - `formToPayload()` helper converts form values to payload via `Number()` coercion
- **Zod transformations applied to all schemas**:
  - `sanitizeString()`: Removes XSS vectors (`<>` removed, script tags stripped, event handlers removed)
  - Field length limits: names ≤100 chars, emails ≤255 chars, contact numbers ≤20 chars, foods ≤50 chars each
  - Age validation: Date of birth must result in age 5-120 years
  - Contact number regex: `/^\+?\d{10,15}$/` allows optional country code
  - Email lowercase & trimmed; food arrays min 1, max 10 items
- **Runtime validation**: `validateBody` middleware (zodValidator.ts) parses request body with SurveyPayloadSchema before reaching controllers; validation errors return 400 with field-level details
- **Type exports**: `SurveyInput` (inferred from SurveyPayloadSchema), `SurveyFormValues` (from SurveyFormSchema), `SurveyResponse` interface for domain layer

### Error Handling

- **Custom error hierarchy** (`src/errors/AppError.ts`):
  - Base `AppError` extends Error with `statusCode` (400/404/500), `isOperational` flag, and stack traces
  - `ValidationError(message, field?)`: 400 status for invalid input
  - `NotFoundError(resource, id?)`: 404 status for missing resources
  - `DatabaseError(message, operation?)`: 500 status for Prisma/database failures
- **Centralized error middleware** (`src/middleware/errorHandler.ts`):
  - Catches AppError, ZodError, Prisma errors; maps to structured JSON with `error.message`, `error.type`, optional stack in development
  - Zod errors flatten to `error.details` with field-level errors
  - Prisma errors mapped to DatabaseError with code exposed in development only
  - Unexpected errors logged and return 500 with sanitized message
- **Controller convention**: All controllers use try/catch with `next(err)` to delegate to error middleware (never send responses in catch blocks)
- **Error tracking middleware** (`src/middleware/errorTracking.ts`): Analyzes error types, categorizes by severity (low/medium/high/critical), generates error fingerprints for duplicate detection

### Caching Strategy

- **Multi-layer caching** (`src/config/cache.ts`):
  - Redis (distributed): Only initialized in production or when `REDIS_ENABLED=true`; uses ioredis with connection pooling, retry strategy, lazy connection
  - NodeCache (in-memory): Fallback when Redis unavailable; auto-purges expired keys every 10 minutes
  - Unified `cacheManager` interface abstracts both layers; applications call same methods
- **Cache-aside pattern**:
  - Services check cache before querying database: `const cached = await cacheManager.get<T>(key); if (cached) return cached;`
  - Cache keys versioned (`survey:results:v1`) for easy invalidation on schema changes
  - TTL: Default 5 minutes (configurable via `CACHE_TTL` env var); specific keys override via `cacheManager.set(key, value, ttl)`
- **Cache invalidation**: Services call `resultsRepository.invalidateCache()` after mutations; ensures 5-min max staleness
- **Metrics**: `cache_hit_ratio`, `cache_operations_total`, `cache_size_bytes` Prometheus gauges track cache health

### Type Mapping

- **Database-to-domain mapping**: Repositories explicitly map Prisma models to domain types (e.g., `mapToDomain()` in `SurveyRepository`)
- **Field conversions**: `foods` stored as CSV in DB; repository parses to/from string arrays
- **Timestamp handling**: `submittedAt` auto-set via Prisma `@default(now())`

## Testing Infrastructure

**Backend Testing** (`npm run test`):

- **Framework**: Vitest (Node environment, globals enabled)
- **Database**: SQLite (`file:./test.db`) for isolated, fast tests
- **Setup**: `src/test/setup.ts` initializes Container, sets `NODE_ENV=test`
- **Mocking**: Repository interfaces enable easy mock injection in services
- **Coverage**: ≥95% required on CI; uploads to Codecov
- **Test files**: `src/test/unit/{controllers,services,repositories,middleware,validation}/`
- **Mocks**: `src/test/mocks/` contains shared mock factories
- **Convention**: Mock repositories via interface, inject into services/controllers
- **Example**: `vi.mock('@/container')` to override Container.getInstance(); return mock container with mock services

**Frontend Testing** (`npm run test --config vitest.config.ts`):

- **Framework**: Vitest with React Testing Library
- **Environment**: jsdom
- **Coverage**: Runs with `test:coverage`

**CI/CD Quality Gates**:

- **ESLint**: Zero-warning policy; fails on any lint error
- **TypeScript**: `npm run typecheck` validates all code
- **Prettier**: Auto-formats on PR (commits with `[skip ci]` to prevent loops)
- **Backend Build**: `npm run build` compiles TS → dist/
- **Test Coverage**: Backend ≥95% required; fails on violations

## Development Workflows

### Local Setup

```bash
# Backend: PostgreSQL required, Redis optional
cd backend && npm install && npm run dev  # Port 5000
# Frontend: Proxies /api/* to backend via Vite
cd frontend && npm install && npm run dev  # Port 3000
```

### Server Middleware Stack (Order Critical)

1. HTTPS redirect (if `SECURITY_HTTPS_REDIRECT=true`)
2. Trust proxy (if `SECURITY_TRUST_PROXY=true`)
3. Helmet security headers
4. Custom security headers
5. Rate limiting by IP (Redis-backed with in-memory fallback)
6. Compression (level 6, threshold 1KB)
7. Request size limiting (default 1MB via `REQUEST_SIZE_LIMIT`)
8. HTTP Parameter Pollution (HPP) protection
9. Input sanitization (removes script tags, event handlers, control chars)
10. CORS (configurable origins via `CORS_ORIGINS` env var, supports non-browser tools)
11. Body parsing (strict JSON + URL-encoded, size-limited)
12. Request context (generates requestId, tracks timing, extracts client IP)
13. Access logging (Winston to console + daily rotating files)
14. Prometheus metrics collection
15. Performance tracking
16. Routes (survey, results, monitoring, health endpoints)
17. Error logging & tracking (must occur before error handler)
18. Central error handler (catches all errors, last middleware)

**Critical**: Security middleware must come before body parsing; error handler must be last

### Build & Deployment

- **Backend**: `npm run build` → TypeScript → `dist/server.js` (requires `npm start`)
- **Frontend**: `npm run build` → Vite SPA → `dist/` (served by Nginx in Docker)
- **Docker**: Multi-stage builds in `Dockerfile`; backend uses node:20, frontend uses Nginx
- **Docker Compose**: Orchestrates backend, frontend (Nginx), PostgreSQL, Redis

### Environment Configuration

- **Config loading**: `src/config/env.ts` uses Zod schema for runtime validation; throws on missing required vars
- **Required vars**: `DATABASE_URL`, `JWT_SECRET` (≥32 chars), `SECURITY_SESSION_SECRET` (≥32 chars)
- **Optional**: `REDIS_ENABLED`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, rate limiting, logging levels
- **Test env** (`.env.test`): SQLite database (`file:./test.db`), no Redis, `LOG_LEVEL=error`
- **Port defaults**: Backend 5000, Frontend 3000; override via `PORT` env var

### Code Quality

- **ESLint**: Zero-warning policy (`eslint "src/**/*.{ts,js}" --quiet`)
- **TypeScript**: `npm run typecheck` validates types without building
- **Formatting**: Prettier via GitHub Actions (auto-commits to PRs on `pull_request` events)
- **Tests**: CI enforces ≥95% backend coverage (`test:coverage` uploads to Codecov)
- **Build artifacts**: Never committed; generated fresh on each run

## Integration Points & Cross-Component Communication

### Security & Input Processing

- **OWASP-compliant security stack**:
  - Helmet CSP: Restricts script sources to `'self'`, blocks iframes, disables plugins
  - Input sanitization: Removes `<>` in Zod, then middleware strips script tags, event handlers, control chars
  - HPP protection: Prevents duplicate parameter attacks
  - Rate limiting: Redis-backed (production) or in-memory fallback; 1000 requests per 15 min default (configurable)
  - CORS: Configurable origins; supports non-browser requests (no origin header)
  - Size limits: 1MB default request body limit; enforced on JSON and URL-encoded
- **Prisma SQL injection protection**: Parameterized queries built-in; no manual escaping needed

### API Structure & Endpoints

- **Routes**: `src/routes/survey.ts` (POST /api/survey), `src/routes/results.ts` (GET /api/results), `src/routes/monitoring.ts`
- **Health endpoints** (Kubernetes-ready):
  - `GET /health`: Full health check (database, cache, memory)
  - `GET /health/live`: Liveness probe (responds if process alive)
  - `GET /health/ready`: Readiness probe (checks database connectivity)
- **Metrics endpoint**: `GET /metrics` (Prometheus format)
- **Swagger UI**: `GET /api-docs` (not in production); OpenAPI spec at `GET /api-docs.json`
- **Middleware stack**: Validation via Zod middleware; all controllers return with try/catch→next(err)
- **Response format**: `{ id: number }` for creates, structured results DTO for queries, `{ error: { message, type, details?, stack? } }` for errors

### Frontend-Backend Sync

- **API service** (`frontend/src/services/api.ts`): Axios client with configurable baseURL from `frontend/src/config/env.ts`
- **API proxy**: Vite `server.proxy` config forwards `/api/*` to backend URL (reads `VITE_API_URL` env var, defaults to `http://localhost:5000`)
- **State management** (`frontend/src/store/useSurveyStore.ts`): Zustand with devtools & persistence
  - `fetchResults()` async action calls backend, caches in localStorage
  - Form validation: Frontend validates with `SurveyFormSchema` before POST
  - Conversion: `formToPayload()` transforms form values (strings) → API payload (numbers)
- **Backend re-validation**: API always re-validates with `SurveyPayloadSchema` before processing

### Logging & Observability

- **Winston logging** (`src/config/logger.ts`):
  - Console output (development): Colorized, compact format with truncated requestId
  - Daily rotating files (production): JSON format, max 20MB per file, 14-day retention
  - Separate error logs with stack traces
  - `logWithContext.info()` / `.error()` includes operation, duration, requestId, userId, metadata
- **Request tracing**:
  - `requestContext` middleware generates UUID requestId (or accepts X-Request-ID header)
  - Propagated through response headers (X-Request-ID) and logs
  - Extracts client IP with proxy awareness (X-Forwarded-For, X-Real-IP)
- **Prometheus metrics** (`src/middleware/metrics.ts`):
  - HTTP: `http_requests_total`, `http_request_duration_seconds`, `http_requests_in_progress`
  - Database: `database_queries_total`, `database_query_duration_seconds`, `database_connections_active`
  - Cache: `cache_operations_total`, `cache_hit_ratio`, `cache_size_bytes`
  - Business: `surveys_created_total`, `survey_results_queried_total`, `active_users`
- **Error tracking** (`src/middleware/errorTracking.ts`):
  - Fingerprints errors by type/message
  - Classifies severity: low/medium/high/critical
  - Detects security incidents (repeated validation errors, rate limit hits)
  - Triggers alerts for critical errors

## Migration & Schema Changes

**Prisma workflow**:

```bash
npx prisma migrate dev --name <description>  # Creates migration + updates schema
npx prisma db push  # Sync schema without migration (dev only)
npm run generate-client  # Regenerates Prisma client
```

**Current schema**: Single `SurveyResponse` model (denormalized `foods` as CSV; TODO migration to normalize)

**Indexes**: Applied to `email`, `dateOfBirth`, `submittedAt` for query optimization; composite index on `(submittedAt, id)` for pagination

**Database design patterns**:

- Age calculated from `dateOfBirth` at query time (not stored)
- Foods stored as CSV string; parsed in application layer (split by `,`, map to domain array)
- Timestamps: `submittedAt` auto-set via `@default(now())`; all UTC

## When Adding Features

1. **Add schema to `shared/validation.ts`** (shared by frontend/backend)
2. **Add Prisma model to `backend/prisma/schema.prisma`** and run `migrate dev`
3. **Implement repository** with `mapToDomain()` for type safety
4. **Implement service** with logging and cache invalidation
5. **Add controller** delegating to service with `next(err)` error handling
6. **Add route** with validation middleware and Swagger JSDoc
7. **Write tests** with mocked repositories; use test database
8. **Update frontend** services/components to consume API## Common Gotchas

- **Form ratings**: Frontend sends strings (`"5"`); backend expects numbers after Zod coercion. Use `SurveyPayloadSchema` for backend, `SurveyFormSchema` for frontend.
- **Cache invalidation**: Services must call `invalidateCache()` after any mutation, or stale data persists for 5 minutes.
- **Timestamps**: All timestamps are UTC; `submittedAt` auto-set by Prisma; frontend should parse as ISO 8601.
- **Type mapping**: Never pass Prisma models directly to responses; always map via repository methods.
- **Environment validation**: Zod schema in `env.ts` runs at startup; missing required vars throw before Container initialization.

## Critical Implementation Details

### Request ID Correlation

- Every request gets a UUID in `requestContext` middleware (or accepts X-Request-ID header from clients)
- Propagated through response headers (`X-Request-ID`) and all logs for full request tracing
- Extract real client IP: Reads X-Forwarded-For/X-Real-IP headers (handles proxies), falls back to socket address

### Input Sanitization Two-Layer Strategy

1. **Zod schema level** (`shared/validation.ts`): Removes `<>` characters via `.transform(sanitizeString)`
2. **Express middleware level** (`src/middleware/security.ts`): Removes script tags, javascript: protocol, event handlers (onclick=), control characters
3. **Prisma level**: Parameterized queries prevent SQL injection automatically

### Rate Limiting Details

- **Redis strategy** (`src/middleware/rateLimiter.ts`): Uses Redis key `ratelimit:{ip}` with SETEX for window management
- **Fallback**: In-memory Map with timestamp-based window reset if Redis unavailable
- **Configuration**: `RATE_LIMIT_WINDOW_MS` (default 900000 = 15 min), `RATE_LIMIT_MAX_REQUESTS` (default 1000)
- **Response headers**: Includes `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` for client awareness

### Database Query Performance

- **Aggregation**: Use Prisma `.aggregate()` for ratings (faster than fetch-all)
- **Food distribution**: Fetches full response set, processes in application layer (more memory efficient than GROUP BY for CSV data)
- **Indexes**: Leverage composite index `(submittedAt, id)` for pagination/sorting queries
- **Connection pooling**: Prisma configures via `DATABASE_URL` connection string

### Health Check System

- **Database test**: Runs raw SQL query `SELECT 1 as health_check` and `findFirst()` to test both read capabilities
- **Cache test**: Calls `cacheManager.healthCheck()` which tests both Redis and NodeCache
- **Memory monitoring**: Tracks heap usage, garbage collection status
- **Response time thresholds**: Database <100ms = healthy, <500ms = degraded, >500ms = unhealthy
- **Endpoints**: `/health` (full), `/health/live` (liveness), `/health/ready` (readiness for Kubernetes)

### Frontend State Management

- **Zustand store** with devtools and localStorage persistence
- **Actions**: `fetchResults()`, `setResults()`, `reset()` for survey data; `toggleDarkMode()`, `setLanguage()` for settings
- **Shallow selector**: `useShallow()` for memoization to prevent unnecessary re-renders
- **Error handling**: Error state stored in store; components display via error boundaries
