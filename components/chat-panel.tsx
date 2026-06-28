"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import type { ChatMessageMetadata } from "@/lib/types";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { AlertCircle, BookOpen, Menu, RotateCcw } from "lucide-react";

interface ChatPanelProps {
  messages: UIMessage<ChatMessageMetadata>[];
  onSend: (text: string) => void;
  onClear: () => void;
  isLoading: boolean;
  error?: Error;
  bookTitle: string;
  onToggleSidebar?: () => void;
}

export function ChatPanel({
  messages,
  onSend,
  onClear,
  isLoading,
  error,
  bookTitle,
  onToggleSidebar,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 bg-white">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open sidebar"
          className="p-1.5 -ml-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-medium text-gray-800 truncate text-sm md:hidden">
          {bookTitle}
        </span>
        <div className="flex-1" />
        {messages.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            disabled={isLoading}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            title="New conversation"
            aria-label="New conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Hi! I&apos;m Paige
            </h2>
            <p className="text-gray-500 max-w-sm">
              I&apos;m here to discuss{" "}
              <span className="font-medium">{bookTitle}</span> with you —
              without any spoilers. Set your reading progress and ask me
              anything!
            </p>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-4 w-4 text-amber-700" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              {error.message || "Something went wrong. Please try again."}
            </span>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} isLoading={isLoading} />
    </div>
  );
}
