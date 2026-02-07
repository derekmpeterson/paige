"use client";

import type { UIMessage } from "ai";
import { BookOpen, User } from "lucide-react";

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
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.parts.map((part, i) => {
            if (part.type === "text") {
              return <span key={i}>{part.text}</span>;
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
