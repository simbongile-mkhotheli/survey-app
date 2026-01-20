# Contributing

Thank you for contributing! Please follow these guidelines.

## Setup

1. **Clone & Install**

```bash
git clone https://github.com/simbongile-mkhotheli/survey-app.git
cd survey-app
npm install
```

1. **Start Development**

```bash
npm run dev
```

1. **Verify Everything Works**

```bash
npm run test
npm run lint
npm run typecheck
```

## Workflow

### Create a Branch

```bash
git checkout -b feat/your-feature-name
```

### Make Changes

- Follow coding standards (TypeScript strict, ESLint rules)
- Write tests for new features
- Ensure all tests pass: `npm run test`

### Commit Changes

Follow **Conventional Commits** format (see [COMMIT_STANDARDS.md](COMMIT_STANDARDS.md)):

```bash
git commit -m "feat(scope): description"
git commit -m "fix(scope): description"
git commit -m "docs: description"
```

### Submit Pull Request

1. Push your branch: `git push origin feat/your-feature-name`
2. Create PR on GitHub
3. Ensure CI checks pass
4. Request review from maintainers

## Code Standards

### TypeScript

- Strict mode enabled (no `any` types)
- Explicit return types on all functions
- Use interfaces for type contracts

### Imports

- Always use path aliases: `@/components`, `@/services`
- Never use relative imports: `../../`

### Testing

- Write tests for new code
- Maintain ≥95% coverage
- Use mocks for dependencies
- Run tests locally before commit: `npm run test`

### Formatting

- ESLint auto-fixes: `npm run lint:fix`
- Prettier auto-formats: Runs in pre-commit hook
- EditorConfig enforces consistency

## Commit Message Format

See [COMMIT_STANDARDS.md](COMMIT_STANDARDS.md) for detailed commit guidelines.

Quick reference:

- `feat(scope): add new feature` → Minor version bump
- `fix(scope): fix bug` → Patch version bump
- `docs: update docs` → No version change
- `refactor(scope): improve code` → No version change
- `test: add tests` → No version change

## Questions?

- Review [README.md](README.md) for project overview
- Check existing issues and discussions
- Ask maintainers in a new issue

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on code, not personalities
- Report serious issues to maintainers privately
