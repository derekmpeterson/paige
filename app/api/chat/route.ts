import {
  streamText,
  UIMessage,
  convertToModelMessages,
  ModelMessage,
} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { buildBookContext } from "@/lib/book-context";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { getBook } from "@/lib/book-store";
import type { ChatMessageMetadata } from "@/lib/types";

const MODEL_ID = process.env.MODEL_ID || "x-ai/grok-4.1-fast";
const INPUT_COST_PER_M = Number(process.env.INPUT_COST_PER_M) || 0.2;
const OUTPUT_COST_PER_M = Number(process.env.OUTPUT_COST_PER_M) || 0.5;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

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
  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OPENROUTER_API_KEY is not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const {
    messages,
    bookId,
    progressPercent,
  }: {
    messages: UIMessage[];
    bookId: string;
    progressPercent: number;
  } = await req.json();

  const book = getBook(bookId);
  if (!book) {
    return new Response(
      JSON.stringify({ error: "Book not found — please re-upload" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const bookContext = buildBookContext(book, progressPercent);
  const system = buildSystemPrompt(
    book.title,
    book.author,
    progressPercent,
    bookContext
  );

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openrouter(MODEL_ID),
    system,
    messages: simplifyMessages(modelMessages),
  });

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }): ChatMessageMetadata | undefined => {
      if (part.type === "finish") {
        const inputTokens = part.totalUsage.inputTokens ?? 0;
        const outputTokens = part.totalUsage.outputTokens ?? 0;
        const totalTokens = part.totalUsage.totalTokens ?? 0;
        const cost =
          (inputTokens * INPUT_COST_PER_M + outputTokens * OUTPUT_COST_PER_M) /
          1_000_000;
        return {
          usage: { inputTokens, outputTokens, totalTokens },
          cost,
        };
      }
    },
  });
}
