import EPub from "epub2";
import { convert } from "html-to-text";
import { encodingForModel } from "js-tiktoken";
import type { BookChapter, ParsedBook } from "./types";

const enc = encodingForModel("gpt-4o");

/** Pull the first h1–h3 text from raw HTML to use as a section title. */
function extractHeading(html: string): string | null {
  const match = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
  if (!match) return null;
  // Strip inner tags and collapse whitespace
  const text = match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return text.length > 0 ? text : null;
}

/** Pull alt text from the first <img> with a non-empty alt attribute. */
function extractImgAlt(html: string): string | null {
  const match = html.match(/<img[^>]*\balt="([^"]+)"[^>]*>/i);
  if (!match) return null;
  const alt = match[1].trim();
  return alt.length > 0 ? alt : null;
}

/**
 * EPUB3 books use a <nav epub:type="toc"> document instead of NCX.
 * epub2 only parses NCX, so we parse the nav document ourselves.
 * Returns a map of href (without fragment) → title.
 */
async function parseEpub3Nav(
  epub: EPub
): Promise<Map<string, string>> {
  const tocByHref = new Map<string, string>();

  // Find the nav document in the manifest — look for id or href containing "nav"
  const navItem = Object.values(
    epub.manifest as Record<
      string,
      { id?: string; href?: string; "media-type"?: string }
    >
  ).find(
    (item) =>
      (item.href && /\bnav\b/i.test(item.href)) ||
      (item.id && /\bnav\b/i.test(item.id))
  );
  if (!navItem?.id) return tocByHref;

  let html: string;
  try {
    html = await new Promise<string>((resolve, reject) => {
      epub.getChapter(navItem.id!, (err: Error | null, text?: string) => {
        if (err) reject(err);
        else resolve(text || "");
      });
    });
  } catch {
    return tocByHref;
  }

  // Find the <nav> element with epub:type="toc"
  const navMatch = html.match(
    /<nav[^>]*epub:type="toc"[^>]*>([\s\S]*?)<\/nav>/i
  );
  if (!navMatch) return tocByHref;

  // Extract all <a href="...">title</a> links from the nav
  const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(navMatch[1])) !== null) {
    // Strip fragment, then strip epub2's /links/<id>/ rewrite prefix
    const href = match[1]
      .replace(/#.*$/, "")
      .replace(/^\/links\/[^/]+\//, "");
    const linkTitle = match[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (href && linkTitle) {
      // Only keep the first TOC entry per href (some books split chapters)
      if (!tocByHref.has(href)) {
        tocByHref.set(href, linkTitle);
      }
    }
  }

  return tocByHref;
}

export async function parseEpub(filePath: string): Promise<ParsedBook> {
  const epub = await EPub.createAsync(filePath, undefined, undefined);

  const title = epub.metadata?.title || "Unknown Title";
  const author = epub.metadata?.creator || "Unknown Author";

  // Build a TOC title lookup by manifest id and by href (without fragment).
  // The TOC often has correct titles even when the spine/flow doesn't.
  const tocById = new Map<string, string>();
  const tocByHref = new Map<string, string>();
  console.log("=== TOC ENTRIES (epub2 NCX) ===");
  for (const entry of epub.toc ?? []) {
    console.log(`  TOC: id=${entry.id} href=${entry.href} title=${JSON.stringify(entry.title)}`);
    if (!entry.title) continue;
    if (entry.id) tocById.set(entry.id, entry.title);
    if (entry.href) {
      tocByHref.set(entry.href.replace(/#.*$/, ""), entry.title);
    }
  }

  // If epub2's NCX-based TOC is empty, try parsing the EPUB3 nav document
  if (tocByHref.size === 0) {
    console.log("=== NCX TOC empty, trying EPUB3 nav document ===");
    const navToc = await parseEpub3Nav(epub);
    for (const [href, navTitle] of navToc) {
      tocByHref.set(href, navTitle);
    }
    console.log(`  EPUB3 nav: found ${navToc.size} entries`);
  }

  console.log(`=== TOC LOOKUP MAPS ===`);
  console.log(`  tocById (${tocById.size} entries):`, Object.fromEntries(tocById));
  console.log(`  tocByHref (${tocByHref.size} entries):`, Object.fromEntries(tocByHref));

  const chapters: BookChapter[] = [];
  let cumulativeOffset = 0;
  let untitledCount = 0;

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

      // Resolve title: spine → TOC by id → TOC by href → img alt → text heading → generic
      const hrefBase = chapter.href?.replace(/#.*$/, "") ?? "";
      const spineTitle = chapter.title || null;
      const tocIdTitle = tocById.get(chapter.id!) || null;
      // Try exact href, then _split_000 variant (TOC points to first split)
      let tocHrefTitle = (hrefBase && tocByHref.get(hrefBase)) || null;
      if (!tocHrefTitle && hrefBase) {
        const split000 = hrefBase.replace(/_split_\d+\./, "_split_000.");
        if (split000 !== hrefBase) {
          tocHrefTitle = tocByHref.get(split000) || null;
        }
      }
      const imgAltTitle = extractImgAlt(html);
      const headingTitle = extractHeading(html);
      const sectionTitle =
        spineTitle ||
        tocIdTitle ||
        tocHrefTitle ||
        imgAltTitle ||
        headingTitle ||
        `Section ${++untitledCount}`;
      console.log(
        `SPINE[${chapters.length}]: id=${chapter.id} href=${hrefBase}` +
        ` | spine=${JSON.stringify(spineTitle)}` +
        ` | tocId=${JSON.stringify(tocIdTitle)}` +
        ` | tocHref=${JSON.stringify(tocHrefTitle)}` +
        ` | imgAlt=${JSON.stringify(imgAltTitle)}` +
        ` | heading=${JSON.stringify(headingTitle)}` +
        ` → ${JSON.stringify(sectionTitle)}`
      );

      const tokenCount = enc.encode(text).length;

      chapters.push({
        id: chapter.id,
        title: sectionTitle,
        text,
        charOffset: cumulativeOffset,
        charLength: text.length,
        tokenCount,
      });

      cumulativeOffset += text.length;
    } catch {
      // Skip chapters that fail to parse
      continue;
    }
  }

  const totalTokens = chapters.reduce((sum, c) => sum + c.tokenCount, 0);

  return {
    title,
    author,
    totalCharacters: cumulativeOffset,
    totalTokens,
    chapters,
  };
}
