# PostgreSQL Test Database - Setup Instructions

## Problem
Integration tests were failing because PostgreSQL test database doesn't exist or the schema wasn't created.

## Solution
We've configured the project to use PostgreSQL for tests (matching production), but you need to set up the database first.

## Setup Steps (Choose One Option)

### Option A: Using Docker (Easiest)

1. **Install Docker Desktop**
   - Windows: https://docs.docker.com/desktop/install/windows-binaries/
   - Download and install Docker Desktop for Windows

2. **Start PostgreSQL test container**
   ```bash
   cd /c/Users/Sirra/Desktop/res/survey-app/backend
   docker-compose -f docker-compose.test.yml up -d
   ```

3. **Run migrations**
   ```bash
   npm run test:db:setup
   ```
   
   Or manually:
   ```bash
   DATABASE_URL="postgresql://test:test@localhost:5432/survey_app_test?schema=public" npx prisma migrate deploy
   ```

4. **Run tests**
   ```bash
   npm test
   ```

### Option B: Install PostgreSQL Locally

1. **Download PostgreSQL 15+**
   - Windows: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Install with default settings, remember the postgres password

2. **Create test database** (using pgAdmin or psql)
   ```sql
   CREATE DATABASE survey_app_test;
   CREATE USER test WITH PASSWORD 'test';
   GRANT ALL PRIVILEGES ON DATABASE survey_app_test TO test;
   ALTER DATABASE survey_app_test OWNER TO test;
   ```

3. **Run migrations**
   ```bash
   cd /c/Users/Sirra/Desktop/res/survey-app/backend
   DATABASE_URL="postgresql://test:test@localhost:5432/survey_app_test?schema=public" npx prisma migrate deploy
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## What Changed

1. **Created `docker-compose.test.yml`**
   - Defines PostgreSQL test container configuration
   - Credentials: `test/test`, database: `survey_app_test`

2. **Created `scripts/setup-test-db.sh`**
   - Automated script to start Docker and run migrations

3. **Created `src/test/utils/db-setup-postgres.ts`**
   - PostgreSQL test database utilities
   - Handles connection, cleanup between tests, teardown

4. **Updated integration tests**
   - `survey.integration.test.ts`: Added PostgreSQL setup/cleanup
   - `results.integration.test.ts`: Added PostgreSQL setup/cleanup

5. **Updated `package.json`**
   - Added `test:db:up` - Start Docker container
   - Added `test:db:down` - Stop Docker container  
   - Added `test:db:setup` - Run migrations
   - Added `test:db:reset` - Reset database

6. **Created `TEST_DATABASE_SETUP.md`**
   - Comprehensive documentation for test database setup

## Quick Commands

```bash
# Start test database (Docker)
npm run test:db:up

# Setup schema
npm run test:db:setup

# Run all tests
npm test

# Run only integration tests
npm run test:integration

# Stop test database
npm run test:db:down

# Reset database (clean slate)
npm run test:db:reset
```

## Verification

After setup, run tests to verify:
```bash
cd /c/Users/Sirra/Desktop/res/survey-app/backend
npm test -- --run
```

Expected: All 48 tests should pass ✅

## Why PostgreSQL for Tests?

✅ **Production Parity**: Same database engine as production  
✅ **Type Safety**: PostgreSQL types behave correctly  
✅ **Constraint Testing**: Tests actual database constraints  
✅ **No Surprises**: What works in tests works in production
