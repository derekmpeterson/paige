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
    model: openrouter("x-ai/grok-4.1-fast"),
    system,
    messages: simplifyMessages(modelMessages),
  });

  return result.toUIMessageStreamResponse();
}
