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
- Running conversation-level token and cost total in the chat header.
- Per-message display of how many input tokens were served from cache.

### Changed

- Request bodies on the chat API are now validated with Zod.
- Per-message cost now uses OpenRouter's actual, cache-adjusted charge
  (`providerMetadata.openrouter.usage.cost`), falling back to a per-token estimate.
- Default model updated from the deprecated `x-ai/grok-4.1-fast` to `x-ai/grok-4.3`.
- The OpenRouter pricing lookup is skipped entirely when using a local server.

### Fixed

- Chat errors are now surfaced in the UI instead of failing silently.
- The model-pricing fetch now times out instead of hanging the first request.
- Cost no longer overstates cached messages by billing cached input tokens at the
  full prompt rate.
- Token usage now displays even when no cost is available (e.g. local models),
  instead of being hidden.
- Tiny costs no longer render as `$0.0000` (adaptive precision / `<$0.0001`).

## [1.0.0]

### Added

- Initial release: EPUB upload and parsing, chapter-level progress tracking,
  spoiler-free AI chat via OpenRouter, and token usage / cost tracking.

[Unreleased]: https://github.com/derekmpeterson/paige/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/derekmpeterson/paige/releases/tag/v1.0.0
