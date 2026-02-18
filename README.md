# Paige

Chat about your books without spoilers.

![Paige screenshot](screenshot.png)

Paige is a web app that lets you discuss any book with AI while respecting exactly how far you've read. Upload an EPUB, set your progress by chapter, and chat freely — Paige will never reveal what happens next.

## Features

- **EPUB upload & parsing** — drag and drop your book to get started
- **Chapter-level progress tracking** — tell Paige how far you've read
- **Spoiler-free AI chat** — powered by Grok via OpenRouter, constrained to only discuss what you've already read
- **Token usage & cost tracking** — see per-message and conversation-level token counts and costs
- **Responsive mobile UI** — slide-in sidebar and full mobile support

## How It Works

When you set your progress, Paige sends the full text of every chapter you've read directly into the LLM's context window. There's no RAG, no embeddings, no chunking — the model sees the complete, unbroken text of everything up to your current chapter.

This is an opinionated choice. The upside is that conversations are richer and more grounded, since the model has full access to every detail, callback, and nuance in what you've read. The tradeoff is that longer books use more tokens (and cost more), and very large books may approach context limits. On the cost side, because the book text is a stable prefix at the start of every request, it's compatible with prompt caching — so after the first message in a conversation, subsequent messages benefit from discounted cached token pricing.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- An [OpenRouter](https://openrouter.ai/) API key

### Setup

```bash
git clone https://github.com/derekmpeterson/paige.git
cd paige
npm install
```

Create a `.env.local` file in the project root:

```
OPENROUTER_API_KEY=your-openrouter-api-key
```

Optionally configure the model (default shown):

```
MODEL_ID=x-ai/grok-4.1-fast
```

`MODEL_ID` is any [OpenRouter model ID](https://openrouter.ai/models). Pricing for cost tracking is fetched automatically from the OpenRouter API.

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- [Next.js](https://nextjs.org/) & React
- TypeScript
- [Vercel AI SDK](https://sdk.vercel.ai/) with [OpenRouter](https://openrouter.ai/) (Grok)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [epub2](https://github.com/nickcis/epub2) for EPUB parsing

## License

[MIT](LICENSE)
