"use client";

import type { UIMessage } from "ai";
import { BookOpen, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
          <BookOpen className="h-4 w-4 text-amber-700" />
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
        <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2">
          {message.parts.map((part, i) => {
            if (part.type === "text") {
              return isUser ? (
                <span key={i} className="whitespace-pre-wrap">{part.text}</span>
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
