"use client";

import type { ParsedBook } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, CheckCircle2, Circle } from "lucide-react";

interface BookSidebarProps {
  book: ParsedBook;
  currentChapterIndex: number;
  onChapterChange: (index: number) => void;
}

export function BookSidebar({
  book,
  currentChapterIndex,
  onChapterChange,
}: BookSidebarProps) {
  const currentChapter = book.chapters[currentChapterIndex];
  const progressPercent = book.totalCharacters > 0
    ? Math.round(
        ((currentChapter.charOffset + currentChapter.charLength) /
          book.totalCharacters) *
          100
      )
    : 0;

  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      {/* Book info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-5 w-5 text-amber-700" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-gray-900 truncate">
              {book.title}
            </h2>
            <p className="text-sm text-gray-500 truncate">{book.author}</p>
          </div>
          <span className="text-xs font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-0.5 flex-shrink-0">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Chapter list */}
      <div className="flex-1 overflow-hidden">
        <div className="px-4 py-2 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Chapters
          </h3>
        </div>
        <ScrollArea className="h-full">
          <div className="p-2">
            {book.chapters.map((chapter, index) => {
              const isCurrent = index === currentChapterIndex;
              const isRead = index < currentChapterIndex;

              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => onChapterChange(index)}
                  className={`
                    w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left
                    transition-colors
                    ${
                      isCurrent
                        ? "bg-amber-50 text-amber-700 font-medium"
                        : isRead
                        ? "text-gray-600 hover:bg-gray-100"
                        : "text-gray-400 hover:bg-gray-100"
                    }
                  `}
                >
                  {isRead ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  ) : isCurrent ? (
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-amber-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 flex-shrink-0" />
                  )}
                  <span className="truncate">{chapter.title}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
