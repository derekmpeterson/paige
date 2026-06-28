import { describe, it, expect } from "vitest";
import { getTextUpToPercent, buildBookContext } from "../book-context";
import type { BookChapter, ParsedBook } from "../types";

const SEP = "\n\n---\n\n";

/** Build a ParsedBook from chapter texts, computing offsets like the parser does. */
function makeBook(texts: string[]): ParsedBook {
  let offset = 0;
  const chapters: BookChapter[] = texts.map((text, i) => {
    const chapter: BookChapter = {
      id: `c${i}`,
      title: `Chapter ${i + 1}`,
      text,
      charOffset: offset,
      charLength: text.length,
      tokenCount: Math.ceil(text.length / 4),
    };
    offset += text.length;
    return chapter;
  });
  return {
    title: "Test Book",
    author: "Test Author",
    totalCharacters: offset,
    totalTokens: chapters.reduce((sum, c) => sum + c.tokenCount, 0),
    chapters,
  };
}

describe("getTextUpToPercent", () => {
  const book = makeBook(["a".repeat(100), "b".repeat(100), "c".repeat(100)]);

  it("returns an empty string at 0%", () => {
    expect(getTextUpToPercent(book, 0)).toBe("");
  });

  it("returns the empty string for negative progress", () => {
    expect(getTextUpToPercent(book, -10)).toBe("");
  });

  it("returns every chapter joined at 100%", () => {
    expect(getTextUpToPercent(book, 100)).toBe(
      ["a".repeat(100), "b".repeat(100), "c".repeat(100)].join(SEP)
    );
  });

  it("includes full earlier chapters and a partial current chapter mid-book", () => {
    // 50% of 300 chars => 150 chars: all of ch1 (100) + first 50 of ch2.
    const result = getTextUpToPercent(book, 50);
    expect(result).toBe("a".repeat(100) + SEP + "b".repeat(50));
    // Never reveals chapter 3 (a spoiler).
    expect(result).not.toContain("c");
  });

  it("does not leak future chapters when stopping exactly on a boundary", () => {
    // ~33% of 300 => 99 chars, still inside chapter 1 only.
    const result = getTextUpToPercent(book, 33);
    expect(result).not.toContain("b");
    expect(result).not.toContain("c");
  });
});

describe("buildBookContext", () => {
  it("returns the verbatim read text when it fits the context window (Tier 1)", () => {
    const book = makeBook(["chapter one text", "chapter two text"]);
    const context = buildBookContext(book, 100);
    expect(context).toBe(getTextUpToPercent(book, 100));
    expect(context).not.toContain("=== BEGINNING OF TEXT READ SO FAR ===");
  });

  it("summarizes the middle when the read text exceeds the window (Tier 2)", () => {
    // MAX_CONTEXT_CHARS is 4,000,000 (1M tokens * 4 chars/token).
    const huge = "x".repeat(4_500_000);
    const book = makeBook([huge]);
    const context = buildBookContext(book, 100);

    expect(context).toContain("=== BEGINNING OF TEXT READ SO FAR ===");
    expect(context).toContain("=== MIDDLE SECTION");
    expect(context).toContain("=== MOST RECENTLY READ TEXT ===");
    expect(context).toContain("=== END OF TEXT READ SO FAR ===");
    // The summarized output must be smaller than the raw read text.
    expect(context.length).toBeLessThan(huge.length);
  });
});
