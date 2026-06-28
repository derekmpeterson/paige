# Contributing to Paige

Thanks for your interest in improving Paige! This document covers how to get set up
and what to check before opening a pull request.

## Getting started

1. Fork and clone the repository.
2. Use the supported Node version (see [`.nvmrc`](.nvmrc) — Node 20.9+). With `nvm`:
   ```bash
   nvm use
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy the example environment file and add your key (or a local server URL):
   ```bash
   cp .env.example .env.local
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

## Before you open a pull request

Please make sure all of the following pass locally:

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest unit tests
npm run format      # Prettier (or `npm run format:check` to verify only)
npm run build       # production build
```

CI runs these same checks on every pull request.

## Guidelines

- **Keep changes focused.** One logical change per pull request makes review easier.
- **Match the existing style.** Code is formatted with Prettier and linted with
  ESLint; run `npm run format` before committing.
- **Add tests for logic changes.** Pure logic in `lib/` (e.g. spoiler-aware context
  building, pricing, parsing helpers) should be covered by unit tests in
  `lib/__tests__/`.
- **Update docs.** If you change configuration, environment variables, or behavior,
  update the README accordingly.
- **Describe your change.** Explain the what and why in the PR description, and link
  any related issue.

## Reporting bugs and requesting features

Use the GitHub [issue tracker](https://github.com/derekmpeterson/paige/issues) and the
provided templates. For security issues, please follow [SECURITY.md](SECURITY.md)
instead of opening a public issue.

By contributing, you agree that your contributions will be licensed under the project's
[MIT License](LICENSE).
