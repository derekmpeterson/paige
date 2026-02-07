import EPub from "epub2";
import { convert } from "html-to-text";
import type { BookChapter, ParsedBook } from "./types";

export async function parseEpub(filePath: string): Promise<ParsedBook> {
  const epub = await EPub.createAsync(filePath, undefined, undefined);

  const title = epub.metadata?.title || "Unknown Title";
  const author = epub.metadata?.creator || "Unknown Author";

  const chapters: BookChapter[] = [];
  let cumulativeOffset = 0;

  // epub.flow gives us the spine order (correct reading order)
  for (const chapter of epub.flow) {
    if (!chapter.id) continue;

    try {
      const html = await new Promise<string>((resolve, reject) => {
        epub.getChapter(chapter.id!, (err: Error | null, text?: string) => {
          if (err) reject(err);
          else resolve(text || "");
        });
      });

      const text = convert(html, {
        wordwrap: false,
        selectors: [
          { selector: "img", format: "skip" },
          { selector: "a", options: { ignoreHref: true } },
        ],
      }).trim();

      if (text.length === 0) continue;

      chapters.push({
        id: chapter.id,
        title: chapter.title || `Chapter ${chapters.length + 1}`,
        text,
        charOffset: cumulativeOffset,
        charLength: text.length,
      });

      cumulativeOffset += text.length;
    } catch {
      // Skip chapters that fail to parse
      continue;
    }
  }

  return {
    title,
    author,
    totalCharacters: cumulativeOffset,
    chapters,
  };
}
