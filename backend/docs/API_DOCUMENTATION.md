# Survey Application API - Developer Guide

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://postgresql.org/)

A comprehensive survey application API built with modern technologies and best practices.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database
- **Git** for version control

### Installation & Setup

```bash
# Clone and navigate to backend
git clone <repository-url>
cd survey-app/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and configuration

# Set up database
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev
```

The API will be available at `http://localhost:5000` with interactive documentation at `http://localhost:5000/api-docs`.

## 📋 API Overview

### Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `POST` | `/api/survey` | Submit survey response | None |
| `GET` | `/api/results` | Get aggregated results | None |
| `GET` | `/api-docs` | Interactive API docs | None |
| `GET` | `/api-docs.json` | OpenAPI specification | None |

### Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://api.survey-app.com`

## 🔍 Detailed API Reference

### POST /api/survey

Submit a new survey response with personal information and ratings.

#### Request Body

```json
{
  "firstName": "string (required, 1-100 chars)",
  "lastName": "string (required, 1-100 chars)",
  "email": "string (required, valid email format)",
  "contactNumber": "string (required, 10-15 digits, optional +)",
  "dateOfBirth": "string (required, YYYY-MM-DD, age 5-120)",
  "foods": "array (required, 1-3 items from: pizza, pasta, papAndWors)",
  "ratingMovies": "string (required, '1'-'5')",
  "ratingRadio": "string (required, '1'-'5')",
  "ratingEatOut": "string (required, '1'-'5')",
  "ratingTV": "string (required, '1'-'5')"
}
```

#### Example Request

```javascript
const response = await fetch('http://localhost:5000/api/survey', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    contactNumber: '+1234567890',
    dateOfBirth: '1990-05-15',
    foods: ['pizza', 'pasta'],
    ratingMovies: '4',
    ratingRadio: '3',
    ratingEatOut: '5',
    ratingTV: '2'
  })
});

const data = await response.json();
console.log('Survey ID:', data.id);
```

#### Response

**Success (201)**
```json
{
  "id": 123
}
```

**Validation Error (400)**
```json
{
  "error": {
    "message": "Validation failed",
    "type": "ValidationError",
    "details": {
      "email": ["Invalid email address"],
      "ratingMovies": ["Please select a rating from 1–5"]
    }
  }
}
```

### GET /api/results

Retrieve aggregated survey analytics and statistics.

#### Example Request

```javascript
const response = await fetch('http://localhost:5000/api/results');
const results = await response.json();

console.log('Total surveys:', results.totalCount);
console.log('Average age:', results.age.avg);
console.log('Food preferences:', results.foodPercentages);
console.log('Average ratings:', results.avgRatings);
```

#### Response (200)

```json
{
  "totalCount": 150,
  "age": {
    "avg": 28.5,
    "min": 18,
    "max": 65
  },
  "foodPercentages": {
    "pizza": 45.5,
    "pasta": 30.2,
    "papAndWors": 24.3
  },
  "avgRatings": {
    "movies": 4.2,
    "radio": 3.1,
    "eatOut": 4.8,
    "tv": 3.5
  }
}
```

## 🛠️ Development Tools

### Interactive Documentation

Visit `http://localhost:5000/api-docs` for Swagger UI with:
- Interactive request testing
- Complete schema documentation
- Example requests and responses
- Authentication details

### Postman Collection

Import the provided Postman collection and environment:

1. **Collection**: `docs/postman-collection.json`
2. **Environment**: `docs/postman-environment.json`

Features:
- Pre-configured requests with examples
- Dynamic test data generation
- Comprehensive test assertions
- Environment variable management

### OpenAPI Specification

Download the machine-readable API spec:
```bash
curl http://localhost:5000/api-docs.json > openapi-spec.json
```

## 🔒 Security Features

### Input Validation
- **Multi-layer validation**: Express-validator + Zod schemas
- **Sanitization**: XSS prevention and input cleaning
- **Type safety**: Strong TypeScript typing throughout

### Security Middleware
- **Helmet.js**: Security headers (CSP, HSTS, etc.)
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: IP-based request throttling
- **HPP Protection**: HTTP parameter pollution prevention
- **Request Size Limits**: Prevent oversized payloads

### Headers
Every response includes security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS only)

## 📊 Error Handling

### Error Response Format

All errors follow a consistent structure:

```json
{
  "error": {
    "message": "Human-readable error description",
    "type": "ErrorTypeName",
    "details": {} // Optional additional context
  }
}
```

### Error Types

| Status | Type | Description |
|--------|------|-------------|
| `400` | `ValidationError` | Invalid input data |
| `404` | `NotFoundError` | Endpoint not found |
| `429` | `RateLimitError` | Rate limit exceeded |
| `500` | `InternalError` | Server error |

### Rate Limiting

- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Headers**: `X-RateLimit-*` in responses

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod + express-validator
- **Documentation**: OpenAPI 3.0 + Swagger UI
- **Testing**: Vitest with comprehensive coverage

### Design Patterns
- **Dependency Injection**: IoC container for service management
- **Repository Pattern**: Data access abstraction
- **SOLID Principles**: Maintainable and extensible code
- **Error Boundaries**: Centralized error handling

### Project Structure
```
src/
├── config/          # Configuration and environment
├── controllers/     # Request handlers
├── services/        # Business logic
├── repositories/    # Data access layer
├── middleware/      # Express middleware
├── routes/          # Route definitions
├── validation/      # Input validation schemas
├── types/          # TypeScript type definitions
├── errors/         # Custom error classes
└── test/           # Test suites
```

## 🧪 Testing

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Coverage
- **48 Tests**: Unit, integration, and security tests
- **Controllers**: Request/response handling
- **Services**: Business logic validation
- **Repositories**: Data access patterns
- **Security**: Middleware and validation
- **Integration**: End-to-end API flows

## 🚀 Deployment

### Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/survey_db"

# Server
PORT=5000
NODE_ENV=production

# Security
CORS_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/survey-api.log
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] CORS origins whitelisted
- [ ] Monitoring and logging set up
- [ ] Health checks implemented
- [ ] Backup strategy in place

### Build & Start

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📈 Monitoring & Observability

### Health Check (Coming Soon)
```javascript
// GET /health
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "memory": {
    "used": 45.2,
    "free": 54.8
  }
}
```

### Logging
- **Structured logging**: JSON format for production
- **Log levels**: error, warn, info, debug
- **Request tracing**: Correlation IDs for debugging

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Add** tests for new functionality
5. **Ensure** all tests pass
6. **Submit** a pull request

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Standardized commit messages

## 📚 Additional Resources

### External Links
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://prisma.io/docs)
- [OpenAPI Specification](https://swagger.io/specification/)
- [TypeScript Handbook](https://typescriptlang.org/docs/)

### API Tools
- **Postman**: Collection and environment files included
- **Insomnia**: Compatible with OpenAPI export
- **curl**: Examples provided throughout documentation
- **HTTPie**: Modern command-line HTTP client

## 🆘 Support

### Getting Help

1. **Documentation**: Check this guide and API docs
2. **Issues**: Create GitHub issues for bugs
3. **Discussions**: Use GitHub discussions for questions
4. **Email**: mkotelisimbo@gmail.com

### Common Issues

**Database Connection Issues**
```bash
# Check database is running
pg_isready -h localhost -p 5432

# Verify connection string
npx prisma db push --preview-feature
```

**Port Already in Use**
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)
```

**Environment Variables**
```bash
# Check environment loading
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

---

**Happy coding! 🎉**

For the latest updates and detailed API changes, visit the [interactive documentation](http://localhost:5000/api-docs) or check the [OpenAPI specification](http://localhost:5000/api-docs.json).