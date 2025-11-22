# CI/CD Pipeline Documentation

This document describes the comprehensive CI/CD pipeline for the Survey Application.

## Overview

The CI/CD pipeline uses GitHub Actions to automatically build, test, and deploy the application. It includes quality checks, security audits, Docker builds, and automated deployments.

## Pipeline Stages

### 1. **Autoformat** (Pull Requests Only)

- **Trigger**: Pull requests to `main` or `develop`
- **Purpose**: Automatically format code with Prettier
- **Actions**:
  - Checks if formatting is needed
  - Formats code if necessary
  - Commits and pushes changes
  - Includes `[skip ci]` to prevent infinite loops

### 2. **Frontend Quality & Build**

- **Runs on**: All pushes and PRs
- **Node Version**: 20.x
- **Steps**:
  1. **Prettier Check**: Validates code formatting
  2. **ESLint**: Lints TypeScript/TSX files with zero warnings allowed
  3. **TypeScript Type Check**: Validates type safety
  4. **Build**: Compiles production build
  5. **Tests**: Runs Vitest test suite
  6. **Coverage**: Uploads coverage to Codecov

### 3. **Backend Quality & Build**

- **Runs on**: All pushes and PRs
- **Node Version**: 20.x
- **Steps**:
  1. **ESLint**: Lints TypeScript files with zero warnings allowed
  2. **TypeScript Type Check**: Validates type safety
  3. **Prisma Client Generation**: Generates test database client
  4. **Database Setup**: Creates test database
  5. **Tests with Coverage**: Runs 95+ tests with coverage reporting
  6. **Build**: Compiles TypeScript to JavaScript
  7. **Coverage Upload**: Sends coverage to Codecov

**Environment Variables (Tests)**:

```yaml
NODE_ENV: test
DATABASE_URL: 'file:./test.db'
PORT: '5001'
REDIS_HOST: 'localhost'
REDIS_PORT: '6379'
LOG_LEVEL: 'error'
```

### 4. **Security Audit**

- **Runs on**: All pushes and PRs
- **Purpose**: Identify security vulnerabilities
- **Steps**:
  1. **Backend Audit**: Checks production dependencies
  2. **Frontend Audit**: Checks production dependencies
  3. **Artifact Upload**: Saves audit results for 30 days
  4. **Critical Check**: Fails if critical vulnerabilities found

**Audit Levels**:

- Critical: ❌ Fails pipeline
- High: ⚠️ Warning (documented)
- Moderate: ℹ️ Informational
- Low: ℹ️ Informational

### 5. **Docker Build & Test**

- **Runs on**: All pushes and PRs (after quality checks)
- **Purpose**: Validate Docker images
- **Steps**:
  1. **Backend Image**: Builds production-ready backend
  2. **Frontend Image**: Builds Nginx-served frontend
  3. **Docker Compose**: Validates configuration
  4. **Cache**: Uses GitHub Actions cache for faster builds

**Image Tags (Test)**:

- `survey-backend:test`
- `survey-frontend:test`

### 6. **Deploy to Staging**

- **Trigger**: Push to `develop` branch
- **Requires**: All quality, security, and Docker checks pass
- **Steps**:
  1. **Build Images**: Creates staging images
  2. **Push to Registry**: Uploads to container registry
  3. **Deploy**: Runs deployment commands (customizable)

**Image Tags (Staging)**:

- `survey-backend:staging-{SHA}`
- `survey-backend:staging-latest`
- `survey-frontend:staging-{SHA}`
- `survey-frontend:staging-latest`

### 7. **Deploy to Production**

- **Trigger**: Push tag starting with `v` (e.g., `v1.0.0`)
- **Requires**: All quality, security, and Docker checks pass
- **Steps**:
  1. **Extract Version**: Gets version from git tag
  2. **Build Images**: Creates production images
  3. **Push to Registry**: Uploads with multiple tags
  4. **Create Release**: Generates GitHub release notes

**Image Tags (Production)**:

- `survey-backend:latest`
- `survey-backend:{VERSION}`
- `survey-backend:{SHA}`
- `survey-frontend:latest`
- `survey-frontend:{VERSION}`
- `survey-frontend:{SHA}`

## Workflow File Structure

```
.github/
└── workflows/
    └── ci.yml
```

## Required Secrets

### Container Registry (Optional)

If not set, defaults to GitHub Container Registry:

```
CONTAINER_REGISTRY: ghcr.io (default)
REGISTRY_USERNAME: github.actor (default)
REGISTRY_PASSWORD: GITHUB_TOKEN (default)
```

### Custom Registry Setup

To use a custom registry, add these secrets:

1. Go to Repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `CONTAINER_REGISTRY`: Your registry URL (e.g., `docker.io`)
   - `REGISTRY_USERNAME`: Your registry username
   - `REGISTRY_PASSWORD`: Your registry password/token

## Branch Protection Rules

Recommended branch protection for `main`:

- ✅ Require pull request before merging
- ✅ Require status checks to pass:
  - `Frontend — ESLint + TypeScript + Build + Tests`
  - `Backend — ESLint + TypeScript + Build + Tests`
  - `Security Audit & Dependency Check`
  - `Docker Build & Test`
- ✅ Require branches to be up to date
- ✅ Require linear history
- ✅ Include administrators

## Local Testing

### Test CI Steps Locally

**Frontend Quality Check**:

```bash
cd frontend
npm ci
npx prettier --check "src/**/*.{ts,tsx,json,css,md}"
npx eslint "src/**/*.{ts,tsx}" --max-warnings 0
npm run typecheck
npm run build
npm test
```

**Backend Quality Check**:

```bash
cd backend
npm ci
npx eslint "src/**/*.{ts,js}" --max-warnings 0
npm run typecheck
npx prisma generate --schema=./prisma/schema.test.prisma
npm run test:coverage
npm run build
```

**Docker Build**:

```bash
# Backend
docker build -t survey-backend:test ./backend

# Frontend
docker build -t survey-frontend:test ./frontend

# Validate Docker Compose
docker compose config
```

## Pipeline Optimization

### Caching Strategy

The pipeline uses npm caching to speed up builds:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm
    cache-dependency-path: |
      package-lock.json
      backend/package-lock.json
      frontend/package-lock.json
```

### Docker Build Cache

GitHub Actions cache is used for Docker layers:

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

### Parallel Execution

Jobs run in parallel where possible:

- Frontend and Backend checks run simultaneously
- Security audit runs in parallel
- Only deployment waits for all checks

## Monitoring & Debugging

### View Pipeline Status

1. Navigate to repository → Actions tab
2. Click on workflow run
3. View individual job logs

### Common Issues

**Issue**: Tests fail with "DATABASE_URL required"
**Solution**: Check `vitest.config.ts` has env variables

**Issue**: Docker build fails
**Solution**: Ensure Dockerfiles exist in `backend/` and `frontend/`

**Issue**: Security audit fails
**Solution**: Run `npm audit` locally and fix critical issues

**Issue**: Prettier autoformat not working
**Solution**: Check workflow has write permissions

### Debug Mode

Enable debug logging by adding this secret:

```
ACTIONS_STEP_DEBUG: true
```

## Deployment Customization

### Staging Deployment

Edit the "Deploy to staging" step in `.github/workflows/ci.yml`:

```yaml
- name: Deploy to staging
  run: |
    # Example: kubectl deployment
    kubectl set image deployment/backend \
      backend=${{ env.CONTAINER_REGISTRY }}/survey-backend:staging-${{ github.sha }}

    # Example: Docker Compose
    docker compose -f docker-compose.staging.yml up -d

    # Example: SSH deployment
    ssh user@staging-server "docker pull ${{ env.CONTAINER_REGISTRY }}/survey-backend:staging-${{ github.sha }}"
```

### Production Deployment

Similar customization for production deployment step.

## Release Process

### Creating a Release

1. **Ensure all tests pass on `main`**:

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create and push version tag**:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **Pipeline automatically**:
   - Builds production images
   - Pushes to registry
   - Creates GitHub release
   - Tags images with version

### Version Naming

Follow semantic versioning:

- `v1.0.0` - Major release
- `v1.1.0` - Minor release (new features)
- `v1.0.1` - Patch release (bug fixes)
- `v1.0.0-beta.1` - Pre-release

## Coverage Reports

Coverage is automatically uploaded to Codecov:

- **Frontend**: `frontend/coverage/coverage-final.json`
- **Backend**: `backend/coverage/coverage-final.json`

View coverage at:

- https://codecov.io/gh/{owner}/{repo}

## Security Best Practices

1. ✅ Dependencies scanned on every PR
2. ✅ Docker images built from scratch (no cached layers from unknown sources)
3. ✅ Non-root users in Docker containers
4. ✅ Security headers enabled (Helmet)
5. ✅ Environment variables never logged
6. ✅ Secrets masked in logs
7. ✅ Minimal base images (Alpine)
8. ✅ Health checks for all services

## Performance Metrics

Typical pipeline duration:

- Frontend Quality: ~3-5 minutes
- Backend Quality: ~4-6 minutes
- Security Audit: ~2-3 minutes
- Docker Build: ~5-8 minutes
- **Total**: ~10-15 minutes

With caching:

- Frontend: ~2-3 minutes
- Backend: ~3-4 minutes
- **Total**: ~6-10 minutes

## Notifications

Add Slack/Discord notifications (optional):

```yaml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Support & Issues

For pipeline issues:

1. Check this documentation
2. Review Actions logs
3. Test locally first
4. Check GitHub Actions status page
5. Create issue with workflow run URL

## Updates & Maintenance

Keep pipeline updated:

- Review GitHub Actions updates monthly
- Update Node.js version as needed
- Update action versions (Dependabot recommended)
- Review and update security audit thresholds
- Monitor pipeline performance

---

**Last Updated**: November 2025
**Pipeline Version**: 2.0
**Maintained by**: Development Team
