import { NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { tmpdir } from "os";
import { parseEpub } from "@/lib/epub-parser";
import { storeBook } from "@/lib/book-store";
import type { BookMeta } from "@/lib/types";

// Guard against accidental huge uploads exhausting memory/disk.
const MAX_EPUB_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("epub") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!file.name.endsWith(".epub")) {
    return NextResponse.json(
      { error: "File must be an .epub" },
      { status: 400 }
    );
  }

  if (file.size > MAX_EPUB_BYTES) {
    return NextResponse.json(
      { error: "File is too large (max 50 MB)" },
      { status: 413 }
    );
  }

  const tempDir = join(tmpdir(), "paige-epub");
  await mkdir(tempDir, { recursive: true });
  const tempPath = join(tempDir, `${randomUUID()}.epub`);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempPath, buffer);

    const book = await parseEpub(tempPath);
    const bookId = storeBook(book);

    const meta: BookMeta = {
      bookId,
      title: book.title,
      author: book.author,
      totalCharacters: book.totalCharacters,
      totalTokens: book.totalTokens,
      chapters: book.chapters.map((c) => ({
        id: c.id,
        title: c.title,
        charOffset: c.charOffset,
        charLength: c.charLength,
        tokenCount: c.tokenCount,
      })),
    };

    return NextResponse.json(meta);
  } catch (error) {
    console.error("Epub parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse epub file" },
      { status: 500 }
    );
  } finally {
    try {
      await unlink(tempPath);
    } catch {
      // ignore cleanup errors
    }
  }
}
