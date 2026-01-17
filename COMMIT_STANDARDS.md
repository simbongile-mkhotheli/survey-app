# Commit Message Standards

## Industry Standard: Conventional Commits

The survey app follows **Conventional Commits** specification, which is the de-facto industry standard used by major projects (Angular, React, Vue, Kubernetes, etc.).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 1. Type (Required)

Must be one of:

- **feat**: A new feature

  - Example: `feat(survey): add export results to CSV functionality`
  - Triggers: MINOR version bump in semantic versioning

- **fix**: A bug fix

  - Example: `fix(form): prevent double submission on validation error`
  - Triggers: PATCH version bump in semantic versioning

- **docs**: Documentation only changes

  - Example: `docs: update API authentication guide`
  - Does NOT trigger version bump

- **style**: Changes that don't affect code meaning (formatting, whitespace, semicolons)

  - Example: `style: remove trailing whitespace in service.ts`
  - Does NOT trigger version bump

- **refactor**: Code change that neither fixes a bug nor adds a feature

  - Example: `refactor(repository): extract data mapping to separate method`
  - Does NOT trigger version bump (unless breaking changes)

- **perf**: Code change that improves performance

  - Example: `perf(results): memoize expensive calculation in Results component`
  - Does NOT trigger version bump

- **test**: Adding or updating tests

  - Example: `test: add comprehensive validation tests for SurveyForm`
  - Does NOT trigger version bump

- **chore**: Changes to build process, dependencies, tooling (not production code)

  - Example: `chore: update eslint configuration`
  - Does NOT trigger version bump

- **ci**: Changes to CI/CD configuration
  - Example: `ci: add code coverage threshold to GitHub Actions`
  - Does NOT trigger version bump

### 2. Scope (Optional but Recommended)

Specifies what part of the codebase is affected:

**Valid scopes for survey app:**

- `survey` - Survey submission feature
- `results` - Results aggregation and display
- `form` - Form validation and input handling
- `store` - State management (Zustand)
- `api` - API integration and services
- `auth` - Authentication/authorization
- `ui` - UI components
- `database` - Database/Prisma operations
- `cache` - Caching layer
- `middleware` - Express middleware
- `validation` - Input validation schemas
- `types` - TypeScript type definitions
- `config` - Configuration files
- `docker` - Docker/containerization
- `monorepo` - Monorepo structure
- `deps` - Dependencies management
- `tests` - Test infrastructure

**Examples:**

- `feat(survey): add survey export feature`
- `fix(form): handle empty food selection validation`
- `test(results): add performance optimization tests`

### 3. Subject (Required)

**CRITICAL: Keep subject lines SHORT (max 50 characters)**

**Most commits should ONLY have a subject line. Body/footer rarely needed.**

This ensures commit history is clean and readable:

- ✅ **Short**: Readable in one-line git log, GitHub UI, notification emails
- ✅ **Focused**: Forces clear thinking about scope of changes
- ✅ **Professional**: Industry standard across all major projects
- ✅ **Quick**: Fast to write, fast to review

**Rules:**

- **Imperative mood**: Use "add" not "added" or "adds"
- **No period**: Don't end with a period
- **Lowercase**: Start lowercase unless using proper nouns
- **Max 50 chars**: Hard limit for readability (GitHub's default column width)
- **Specific but concise**: What changed and why in as few words as possible

**Examples:**

✅ **Good (short, clear):**

- `feat(survey): add CSV export`
- `fix(cache): prevent stale data`
- `refactor(validation): extract phone validator`
- `refactor(types): remove unused async helpers`
- `docs: update API guide`
- `test(form): add validation tests`

❌ **Bad (too long or unclear):**

- `feat(survey): add comprehensive survey response export functionality to CSV format` (way too long)
- `feat(survey): added stuff` (vague)
- `feat: Make improvements to the survey export.` (period, capitalized wrong)

**Golden Rule:** If you need more than 50 characters, you can usually say it shorter. Remove adjectives.

### 4. Body (Optional, Only When Necessary)

Only add a body when the subject line alone is insufficient. Most commits don't need one.

- **Explain WHY**, not WHAT (WHAT is in the code)
- **Wrap at 72 characters** per line
- **Separate from subject with blank line**
- **Use imperative mood**: "refactor" not "refactored"
- **Use bullet points** for multiple reasons

**Example:**

```
feat(results): add real-time data updates via WebSocket

Implement WebSocket connection for live results updates instead of polling.
This reduces server load by 70% and improves client responsiveness.

Reasons for this change:
- Previous polling caused excessive database queries
- Real-time updates improve user experience
- WebSocket reduces bandwidth usage
- Enables multi-user collaboration features
```

### 5. Footer (Optional but Important)

Used for:

- **Breaking Changes**: Start with `BREAKING CHANGE:`

  ```
  BREAKING CHANGE: removed deprecated survey status field.
  Use 'submissionStatus' instead.
  ```

- **Issue References**: Link to GitHub/Jira issues

  ```
  Fixes #123
  Closes #124, #125
  Related to #126
  ```

- **Co-authors** (rare)
  ```
  Co-authored-by: Jane Doe <jane@example.com>
  ```

**Example with body (only when needed):**

```
refactor(cache): simplify invalidation logic

Consolidate three separate invalidation methods into one utility
function. Reduces code duplication and makes cache management clearer.
```

**Example without body (preferred):**

```
refactor(cache): simplify invalidation logic
```

The second one is preferred. If the commit title clearly explains the change, skip the body.

## Breaking Changes

If your commit introduces a **breaking change**, you MUST:

1. Add `BREAKING CHANGE:` footer
2. Start the commit type with `!`
3. Document migration path in body

**Example:**

```
feat(api)!: rename survey submission endpoint from /api/submit to /api/surveys/create

BREAKING CHANGE: The POST /api/submit endpoint has been removed.
Use POST /api/surveys/create instead with the same payload format.

Migration Guide:
- Update all API calls from `/api/submit` to `/api/surveys/create`
- No payload format changes required
- Redirect middleware available for 6-month deprecation period
```

## Real-World Examples (Industry Standards)

From major projects:

**Angular:**

```
feat(core): support for metadata in decorators
```

**Vue:**

```
feat: add support for dynamic component slots
```

**React:**

```
fix(reconciler): prevent unmounting during error boundary handling
```

**Kubernetes:**

```
feat(kubelet): allow recovery from container logs rotation
```

## Common Mistakes to Avoid

❌ **Wrong:**

- `Updated stuff` - no type, vague subject
- `feat: Updated the form to add validation` - wrong mood, too verbose
- `feat(survey): Added new survey creation feature.` - period, added not add
- `FEAT(SURVEY): ADD SURVEY` - type/scope should be lowercase
- `feat: This is a very long commit message that explains in excessive detail` - too long

✅ **Correct:**

- `feat(survey): add survey form`
- `fix(validation): handle null phone numbers`
- `test(form): add validation tests`
- `refactor(cache): simplify invalidation`

## Semantic Versioning Connection

Conventional Commits enable **automatic semantic versioning**:

- `feat:` → Minor version bump (1.0.0 → 1.1.0)
- `fix:` → Patch version bump (1.0.0 → 1.0.1)
- `BREAKING CHANGE:` → Major version bump (1.0.0 → 2.0.0)
- Other types → No version bump

This allows **automated changelog generation** and release management.

## Tools

Popular tools that work with Conventional Commits:

- **commitizen** - CLI for guided commit creation
- **husky** - Git hooks to enforce standards
- **conventional-changelog** - Auto-generate changelogs
- **semantic-release** - Automated versioning and publishing
- **commitlint** - Validate commit messages

## Quick Reference

```
feat(scope): description          # New feature
fix(scope): description           # Bug fix
refactor(scope): description      # Code refactoring
perf(scope): description          # Performance improvement
test(scope): description          # Tests added/updated
docs: description                 # Documentation
style: description                # Formatting (no code change)
chore: description                # Build/tooling/dependencies
ci: description                   # CI/CD configuration

# For breaking changes:
feat(scope)!: description         # With BREAKING CHANGE footer
```

## References

- **Official Spec**: https://www.conventionalcommits.org
- **Angular Convention**: https://github.com/angular/angular/blob/main/CONTRIBUTING.md
- **Semantic Versioning**: https://semver.org
