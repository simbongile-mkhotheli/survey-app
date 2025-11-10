# Test Database Setup

This project uses **PostgreSQL** for both production and testing to ensure consistency.

## Quick Start

### Option 1: Docker (Recommended)

1. **Install Docker Desktop**: https://docs.docker.com/get-docker/

2. **Start the test database**:
   ```bash
   cd backend
   docker-compose -f docker-compose.test.yml up -d
   ```

3. **Run migrations**:
   ```bash
   npm run test:db:setup
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Stop the database** (when done):
   ```bash
   docker-compose -f docker-compose.test.yml down
   ```

### Option 2: Local PostgreSQL Installation

1. **Install PostgreSQL 15+**: https://www.postgresql.org/download/

2. **Create test database**:
   ```bash
   psql -U postgres
   CREATE DATABASE survey_app_test;
   CREATE USER test WITH PASSWORD 'test';
   GRANT ALL PRIVILEGES ON DATABASE survey_app_test TO test;
   \q
   ```

3. **Run migrations**:
   ```bash
   cd backend
   DATABASE_URL="postgresql://test:test@localhost:5432/survey_app_test?schema=public" npx prisma migrate deploy
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

## Configuration

Test database configuration is in `backend/.env.test`:

```bash
DATABASE_URL="postgresql://test:test@localhost:5432/survey_app_test?schema=public"
```

## CI/CD Setup

For GitHub Actions or other CI environments:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    env:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: survey_app_test
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

## Troubleshooting

### "Can't reach database server at localhost:5432"

**Docker Solution**:
```bash
docker-compose -f docker-compose.test.yml up -d
docker ps  # Verify container is running
```

**Local PostgreSQL Solution**:
```bash
# Windows
pg_ctl status
net start postgresql-x64-15  # or your version

# Linux/Mac
sudo service postgresql status
sudo service postgresql start
```

### "The table public.survey_responses does not exist"

Run migrations:
```bash
cd backend
npm run test:db:setup
```

Or manually:
```bash
DATABASE_URL="postgresql://test:test@localhost:5432/survey_app_test?schema=public" npx prisma migrate deploy
```

### Reset test database

```bash
cd backend
DATABASE_URL="postgresql://test:test@localhost:5432/survey_app_test?schema=public" npx prisma migrate reset --force
```

## Why PostgreSQL for Tests?

1. **Production Parity**: Same database engine as production eliminates compatibility issues
2. **Type Consistency**: PostgreSQL types (JSONB, Arrays) behave correctly
3. **Constraint Validation**: Tests database constraints exactly as they work in production
4. **Performance**: PostgreSQL performance characteristics match production
5. **Migration Testing**: Validates migrations work correctly before deploying

## NPM Scripts

Add these to `backend/package.json`:

```json
{
  "scripts": {
    "test:db:up": "docker-compose -f docker-compose.test.yml up -d",
    "test:db:down": "docker-compose -f docker-compose.test.yml down",
    "test:db:setup": "bash scripts/setup-test-db.sh",
    "test:db:reset": "DATABASE_URL=\"postgresql://test:test@localhost:5432/survey_app_test?schema=public\" npx prisma migrate reset --force"
  }
}
```
