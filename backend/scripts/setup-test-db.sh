#!/bin/bash
# Setup script for PostgreSQL test database

set -e

echo "🔧 Setting up PostgreSQL test database..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Start PostgreSQL container
echo "🐳 Starting PostgreSQL test container..."
docker-compose -f docker-compose.test.yml up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout=30
counter=0
until docker exec survey-app-test-db pg_isready -U test > /dev/null 2>&1; do
    counter=$((counter + 1))
    if [ $counter -gt $timeout ]; then
        echo "❌ Timeout waiting for PostgreSQL to start"
        exit 1
    fi
    echo "   Waiting... ($counter/$timeout)"
    sleep 1
done

echo "✅ PostgreSQL is ready!"

# Run migrations
echo "🔄 Running Prisma migrations..."
DATABASE_URL="postgresql://test:test@localhost:5432/survey_app_test?schema=public" npx prisma migrate deploy

echo "✅ Test database setup complete!"
echo ""
echo "📝 To run tests: npm test"
echo "🛑 To stop the database: docker-compose -f docker-compose.test.yml down"
