# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Support for local OpenAI-compatible model servers (e.g. llama.cpp) via
  `LLAMA_SERVER_URL` / `LLAMA_MODEL_ID`.
- Unit test suite (Vitest) covering spoiler-aware context building, model pricing,
  and EPUB title-extraction helpers.
- Contributor documentation: `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`.
- Continuous integration (GitHub Actions) running lint, type-check, tests, and build.
- Prettier formatting, `typecheck`/`format`/`test` npm scripts, and an `.nvmrc`.

### Changed

- Request bodies on the chat API are now validated with Zod.

### Fixed

- Chat errors are now surfaced in the UI instead of failing silently.
- The model-pricing fetch now times out instead of hanging the first request.

## [1.0.0]

### Added

- Initial release: EPUB upload and parsing, chapter-level progress tracking,
  spoiler-free AI chat via OpenRouter, and token usage / cost tracking.

[Unreleased]: https://github.com/derekmpeterson/paige/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/derekmpeterson/paige/releases/tag/v1.0.0
