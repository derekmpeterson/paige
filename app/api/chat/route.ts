import {
  streamText,
  UIMessage,
  convertToModelMessages,
  ModelMessage,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { buildBookContext } from "@/lib/book-context";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { getBook } from "@/lib/book-store";
import { getModelPricing } from "@/lib/model-pricing";
import type { ChatMessageMetadata } from "@/lib/types";

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const chatRequestSchema = z.object({
  messages: z.array(z.unknown()),
  bookId: z.string().min(1),
  progressPercent: z.number().min(0).max(100),
});

const USE_LOCAL_SERVER = !!process.env.LLAMA_SERVER_URL;
const MODEL_ID = USE_LOCAL_SERVER
  ? process.env.LLAMA_MODEL_ID || "llama-3.1-8b"
  : process.env.MODEL_ID || "x-ai/grok-4.1-fast";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const llm = USE_LOCAL_SERVER
  ? createOpenAI({
      baseURL: process.env.LLAMA_SERVER_URL,
      apiKey: "not-needed",
      fetch: async (url, init) => {
        // Merge consecutive system messages into one (Qwen templates reject multiple)
        if (typeof init?.body === "string") {
          try {
            const parsed = JSON.parse(init.body);
            const msgs: Array<{ role: string; content: string }> =
              parsed.messages ?? [];
            const merged: typeof msgs = [];
            for (const msg of msgs) {
              const prev = merged[merged.length - 1];
              if (msg.role === "system" && prev?.role === "system") {
                prev.content += "\n\n" + msg.content;
              } else {
                merged.push({ ...msg });
              }
            }
            parsed.messages = merged;
            return fetch(url, { ...init, body: JSON.stringify(parsed) });
          } catch {
            // Body wasn't JSON we could rewrite — send it through unchanged.
            return fetch(url, init);
          }
        }
        return fetch(url, init);
      },
    })
  : openrouter;

/**
 * Simplify model messages so every assistant turn is a plain text string.
 * xAI (Grok) rejects multi-part content arrays that include reasoning,
 * source, or other non-text parts the Vercel AI SDK may produce.
 */
function simplifyMessages(msgs: ModelMessage[]): ModelMessage[] {
  return msgs.map((msg) => {
    if (msg.role !== "assistant" || typeof msg.content === "string") return msg;

    // Extract only text parts and join them
    const text = msg.content
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");

    return { ...msg, content: text };
  });
}

export async function POST(req: Request) {
  if (!USE_LOCAL_SERVER && !process.env.OPENROUTER_API_KEY) {
    return jsonError("OPENROUTER_API_KEY is not set", 500);
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = chatRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonError("Invalid request body", 400);
  }
  const { messages, bookId, progressPercent } = parsed.data;

  const book = getBook(bookId);
  if (!book) {
    return jsonError("Book not found — please re-upload", 404);
  }

  const bookContext = buildBookContext(book, progressPercent);
  const system = buildSystemPrompt(
    book.title,
    book.author,
    progressPercent,
    bookContext
  );

  const modelMessages = await convertToModelMessages(messages as UIMessage[]);
  const pricing = await getModelPricing(MODEL_ID);

  const result = streamText({
    model: USE_LOCAL_SERVER ? llm.chat(MODEL_ID) : llm(MODEL_ID),
    system,
    messages: simplifyMessages(modelMessages),
  });

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }): ChatMessageMetadata | undefined => {
      if (part.type === "finish") {
        const inputTokens = part.totalUsage.inputTokens ?? 0;
        const outputTokens = part.totalUsage.outputTokens ?? 0;
        const totalTokens = part.totalUsage.totalTokens ?? 0;
        const cost = pricing
          ? inputTokens * pricing.prompt + outputTokens * pricing.completion
          : undefined;
        return {
          usage: { inputTokens, outputTokens, totalTokens },
          cost,
        };
      }
    },
  });
}
