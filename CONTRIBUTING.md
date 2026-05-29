# Contributing

Thank you for contributing. Keep changes focused, easy to review, and aligned
with the current React + Supabase architecture.

## Setup

1. Clone and install dependencies:

```bash
git clone https://github.com/simbongile-mkhotheli/survey-app.git
cd survey-app
npm install
```

2. Configure the frontend environment:

```bash
cp frontend/.env.example frontend/.env.local
```

Set the Supabase project URL and publishable anon key in
`frontend/.env.local`. For a new Supabase project, run
`supabase/schema.sql` in the Supabase SQL Editor before testing the app.

3. Start development:

```bash
npm run dev --workspace frontend
```

4. Verify changes:

```bash
npm run typecheck
npm run lint --workspace frontend
npm run build --workspace frontend
```

## Workflow

### Create A Branch

```bash
git checkout -b feat/your-feature-name
```

Use short, descriptive branch names:

- `feat/supabase-survey-migration`
- `fix/rating-reset`
- `docs/readme-setup`

### Make Changes

- Follow TypeScript strict mode and ESLint.
- Keep Supabase access behind service modules in `frontend/src/services`.
- Reuse existing component and hook patterns.
- Do not expose Supabase secret or service-role keys in frontend code or env
  files.

### Commit Changes

Use Conventional Commits. See [COMMIT_STANDARDS.md](COMMIT_STANDARDS.md).

```bash
git commit -m "feat(survey): add submission flow"
git commit -m "fix(form): clear ratings after submit"
git commit -m "docs: update setup instructions"
```

### Submit A Pull Request

1. Push your branch: `git push origin feat/your-feature-name`
2. Create a pull request on GitHub
3. Complete the PR template
4. Ensure verification commands pass

## Code Standards

### TypeScript

- Prefer explicit domain types at service boundaries.
- Avoid `any` unless there is a documented integration boundary.
- Keep validation rules in `shared/validation.ts` when they apply to survey
  data.

### Imports

- Use path aliases for app imports such as `@/components` and `@/services`.
- Relative imports are acceptable for files in the same feature folder.

### Formatting

- ESLint: `npm run lint --workspace frontend`
- Build check: `npm run build --workspace frontend`
- EditorConfig enforces baseline formatting.

## Questions

- Review [README.md](README.md) for setup and architecture.
- Check existing issues and pull requests.
- Open a focused issue when behavior or requirements are unclear.
