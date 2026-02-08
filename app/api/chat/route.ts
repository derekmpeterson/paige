import { streamText, UIMessage, convertToModelMessages } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { buildBookContext } from "@/lib/book-context";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { getBook } from "@/lib/book-store";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

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

  const result = streamText({
    model: openrouter("google/gemini-2.5-flash-lite"),
    system,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
