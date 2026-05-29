# Commit Message Standards

This repository uses Conventional Commits. The goal is readable history, not
ceremony.

## Format

```text
<type>(<scope>): <subject>
```

Use a body when the reason for the change is not obvious from the diff.

## Types

- `feat`: user-visible feature
- `fix`: bug fix
- `docs`: documentation-only change
- `refactor`: code change without behavior change
- `chore`: tooling, dependencies, or maintenance
- `style`: formatting-only change
- `test`: tests only
- `ci`: CI/CD configuration

## Recommended Scopes

- `survey`: submission flow
- `results`: aggregate results flow
- `form`: form state, registration, or validation UX
- `validation`: shared Zod schemas
- `supabase`: schema, RLS, RPC, or client integration
- `services`: frontend service modules
- `ui`: reusable UI components
- `config`: environment or build configuration
- `deps`: dependency updates
- `docs`: documentation

## Subject Rules

- Use imperative mood: `add`, not `added` or `adds`.
- Keep it concise and specific.
- Do not end with a period.
- Start lowercase unless using a proper noun.

## Examples

```text
feat(supabase): add aggregate results RPC
fix(form): clear rating inputs after submit
docs: update Supabase setup instructions
chore(deps): update frontend dependencies
```

For breaking changes, add `!` after the type or scope and explain the migration
path in the body:

```text
feat(supabase)!: change results access to aggregate RPC

BREAKING CHANGE: Results must be read through get_survey_results().
Run supabase/schema.sql before deploying this change.
```

## Branch Names

Use short, descriptive branch names:

```text
feat/supabase-survey-migration
fix/rating-reset
docs/readme-setup
```

## References

- https://www.conventionalcommits.org
