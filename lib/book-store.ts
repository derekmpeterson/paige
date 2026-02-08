import { randomUUID } from "crypto";
import type { ParsedBook } from "./types";

const books = new Map<string, ParsedBook>();

export function storeBook(book: ParsedBook): string {
  const id = randomUUID();
  books.set(id, book);
  return id;
}

export function getBook(id: string): ParsedBook | undefined {
  return books.get(id);
}
