# Contributing to CoreFiles

**Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.**
**Developer: amdsaib96**

CoreFiles is a proprietary project. Direct contributions from external
parties are not currently accepted, but the following guidelines apply to
internal development.

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation only
- `style` — formatting (no code change)
- `refactor` — code change that neither fixes a bug nor adds a feature
- `perf` — performance improvement
- `test` — adding or correcting tests
- `chore` — build/tooling changes
- `security` — security fix

### Examples
```
feat(upload): add chunked resumable upload engine
fix(nav): resolve duplicate React key warning in dock
docs(readme): update deployment guide
security(auth): enforce 2FA for admin accounts
```

## Branch Strategy

- `main` — production-ready, always deployable
- `develop` — integration branch for next release
- `feat/<name>` — feature branches
- `fix/<name>` — bug fix branches
- `release/v<x.y.z>` — release preparation

## Versioning

We use [Semantic Versioning](https://semver.org/):
- MAJOR: incompatible API changes
- MINOR: new features (backward-compatible)
- PATCH: bug fixes (backward-compatible)

Tags: `v1.0.0`, `v1.0.1`, `v1.1.0`, etc.

## Code Quality

- Strict TypeScript — no `any` types
- ESLint + Prettier enforced via `bun run lint`
- SOLID principles + Clean Architecture
- Reusable components — no duplicated logic
- All new API routes must document the production NestJS implementation
- Every source file includes the standard copyright header

## Pull Request Checklist

- [ ] Lint passes (`bun run lint`)
- [ ] No console errors in dev server
- [ ] Component is responsive (mobile + tablet + desktop)
- [ ] Accessibility: keyboard nav + ARIA labels + WCAG AA
- [ ] No hardcoded secrets or credentials
- [ ] Copyright header on new files
- [ ] Commit message follows Conventional Commits

## Contact

- Developer: amdsaib96
- Email: hasan@hasanurjaya.com

© 2026 Hasanur Jaya Sdn. Bhd. All rights reserved.
