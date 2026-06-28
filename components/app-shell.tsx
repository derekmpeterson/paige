"use client";

import { useState, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import type { BookMeta, ChatMessageMetadata } from "@/lib/types";
import { UploadZone } from "./upload-zone";
import { BookSidebar } from "./book-sidebar";
import { ChatPanel } from "./chat-panel";

const transport = new DefaultChatTransport({
  api: "/api/chat",
});

export function AppShell() {
  const [book, setBook] = useState<BookMeta | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const progressPercent = useMemo(() => {
    if (!book || book.chapters.length === 0) return 0;
    const chapter = book.chapters[currentChapterIndex];
    const chapterEnd = chapter.charOffset + chapter.charLength;
    return Math.round((chapterEnd / book.totalCharacters) * 100);
  }, [book, currentChapterIndex]);

  const { messages, setMessages, sendMessage, status, error } = useChat<
    UIMessage<ChatMessageMetadata>
  >({ transport });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSend = useCallback(
    (text: string) => {
      if (!book) return;
      sendMessage(
        { text },
        {
          body: {
            bookId: book.bookId,
            progressPercent,
          },
        }
      );
    },
    [book, progressPercent, sendMessage]
  );

  const handleChapterChange = useCallback((index: number) => {
    setCurrentChapterIndex(index);
    setSidebarOpen(false);
  }, []);

  if (!book) {
    return <UploadZone onBookParsed={(b) => setBook(b as BookMeta)} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <BookSidebar
        book={book}
        currentChapterIndex={currentChapterIndex}
        onChapterChange={handleChapterChange}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <ChatPanel
          messages={messages}
          onSend={handleSend}
          onClear={() => setMessages([])}
          isLoading={isLoading}
          error={error}
          bookTitle={book.title}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />
      </div>
    </div>
  );
}
