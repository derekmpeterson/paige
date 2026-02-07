import type { ParsedBook } from "./types";

const CHARS_PER_TOKEN = 4;
const MAX_CONTEXT_TOKENS = 120_000;
const MAX_CONTEXT_CHARS = MAX_CONTEXT_TOKENS * CHARS_PER_TOKEN;

export function getTextUpToPercent(book: ParsedBook, percent: number): string {
  if (percent <= 0) return "";
  if (percent >= 100) {
    return book.chapters.map((c) => c.text).join("\n\n---\n\n");
  }

  const targetChars = Math.floor(book.totalCharacters * (percent / 100));
  const parts: string[] = [];

  for (const chapter of book.chapters) {
    if (chapter.charOffset >= targetChars) break;

    const chapterEnd = chapter.charOffset + chapter.charLength;
    if (chapterEnd <= targetChars) {
      // Full chapter is within progress
      parts.push(chapter.text);
    } else {
      // Partial chapter — slice to the exact point
      const charsNeeded = targetChars - chapter.charOffset;
      parts.push(chapter.text.slice(0, charsNeeded));
    }
  }

  return parts.join("\n\n---\n\n");
}

export function buildBookContext(book: ParsedBook, percent: number): string {
  const fullText = getTextUpToPercent(book, percent);

  if (fullText.length <= MAX_CONTEXT_CHARS) {
    // Tier 1: fits in context window — include verbatim
    return fullText;
  }

  // Tier 2: too large — include beginning + end, skip middle
  const firstPortionChars = Math.floor(MAX_CONTEXT_CHARS * 0.2);
  const lastPortionChars = Math.floor(MAX_CONTEXT_CHARS * 0.6);
  const firstPortion = fullText.slice(0, firstPortionChars);
  const lastPortion = fullText.slice(fullText.length - lastPortionChars);

  // Build chapter summaries for the middle portion
  const middleStart = firstPortionChars;
  const middleEnd = fullText.length - lastPortionChars;
  const middleChapters = book.chapters.filter((c) => {
    const cEnd = c.charOffset + c.charLength;
    return cEnd > middleStart && c.charOffset < middleEnd;
  });

  const chapterList = middleChapters
    .map((c) => `- ${c.title} (${c.charLength.toLocaleString()} characters)`)
    .join("\n");

  return [
    "=== BEGINNING OF TEXT READ SO FAR ===",
    firstPortion,
    "",
    "=== MIDDLE SECTION (summarized — chapters the reader has passed through) ===",
    chapterList,
    "",
    "=== MOST RECENTLY READ TEXT ===",
    lastPortion,
    "=== END OF TEXT READ SO FAR ===",
  ].join("\n");
}
