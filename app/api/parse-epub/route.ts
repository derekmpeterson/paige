import { NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { tmpdir } from "os";
import { parseEpub } from "@/lib/epub-parser";

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

  const tempDir = join(tmpdir(), "paige-epub");
  await mkdir(tempDir, { recursive: true });
  const tempPath = join(tempDir, `${randomUUID()}.epub`);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempPath, buffer);

    const book = await parseEpub(tempPath);
    return NextResponse.json(book);
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
