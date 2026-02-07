"use client";

import { useState, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { ParsedBook } from "@/lib/types";
import { UploadZone } from "./upload-zone";
import { BookSidebar } from "./book-sidebar";
import { ChatPanel } from "./chat-panel";

const transport = new DefaultChatTransport({
  api: "/api/chat",
});

export function AppShell() {
  const [book, setBook] = useState<ParsedBook | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const progressPercent = useMemo(() => {
    if (!book || book.chapters.length === 0) return 0;
    const chapter = book.chapters[currentChapterIndex];
    const chapterEnd = chapter.charOffset + chapter.charLength;
    return Math.round((chapterEnd / book.totalCharacters) * 100);
  }, [book, currentChapterIndex]);

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSend = useCallback(
    (text: string) => {
      if (!book) return;
      sendMessage(
        { text },
        {
          body: {
            book,
            progressPercent,
          },
        }
      );
    },
    [book, progressPercent, sendMessage]
  );

  if (!book) {
    return <UploadZone onBookParsed={(b) => setBook(b as ParsedBook)} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <BookSidebar
        book={book}
        currentChapterIndex={currentChapterIndex}
        onChapterChange={setCurrentChapterIndex}
      />
      <div className="flex-1 flex flex-col">
        <ChatPanel
          messages={messages}
          onSend={handleSend}
          isLoading={isLoading}
          bookTitle={book.title}
        />
      </div>
    </div>
  );
}
