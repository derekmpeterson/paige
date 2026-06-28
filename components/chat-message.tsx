"use client";

import type { UIMessage } from "ai";
import type { ChatMessageMetadata } from "@/lib/types";
import { BookOpen, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

function formatTokens(n: number): string {
  return n >= 1000
    ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
    : String(n);
}

interface ChatMessageProps {
  message: UIMessage<ChatMessageMetadata>;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const meta = message.metadata as ChatMessageMetadata | undefined;

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="relative group flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-amber-700" />
          </div>
          {meta?.cost != null && (
            <div className="absolute left-10 top-0 z-10 hidden group-hover:block whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg">
              <span className="font-semibold">${meta.cost.toFixed(4)}</span>
              {meta.usage && (
                <span className="ml-2 text-gray-400">
                  {formatTokens(meta.usage.inputTokens)} in /{" "}
                  {formatTokens(meta.usage.outputTokens)} out
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-2.5
          ${
            isUser
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-800"
          }
        `}
      >
        <div
          className={`text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 ${isUser ? "prose-invert" : ""}`}
        >
          {message.parts.map((part, i) => {
            if (part.type === "text") {
              return isUser ? (
                <span key={i} className="whitespace-pre-wrap">
                  {part.text}
                </span>
              ) : (
                <ReactMarkdown key={i}>{part.text}</ReactMarkdown>
              );
            }
            return null;
          })}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="h-4 w-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}
