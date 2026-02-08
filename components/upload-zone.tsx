"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, BookOpen, Loader2 } from "lucide-react";

interface UploadZoneProps {
  onBookParsed: (book: unknown) => void;
}

export function UploadZone({ onBookParsed }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".epub")) {
        setError("Please upload an .epub file");
        return;
      }

      setError(null);
      setIsParsing(true);

      try {
        const formData = new FormData();
        formData.append("epub", file);

        const res = await fetch("/api/parse-epub", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to parse epub");
        }

        const book = await res.json();
        onBookParsed(book);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse epub");
      } finally {
        setIsParsing(false);
      }
    },
    [onBookParsed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookOpen className="h-8 w-8 text-amber-600" />
          <h1 className="text-4xl font-bold text-gray-900">Paige</h1>
        </div>
        <p className="text-gray-500 text-lg">
          Your spoiler-free book discussion companion
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          w-full max-w-md border-2 border-dashed rounded-xl p-12
          flex flex-col items-center justify-center gap-4
          cursor-pointer transition-colors
          ${
            isDragging
              ? "border-amber-500 bg-amber-50"
              : "border-gray-300 hover:border-gray-400 bg-white"
          }
          ${isParsing ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".epub"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {isParsing ? (
          <>
            <Loader2 className="h-10 w-10 text-amber-600 animate-spin" />
            <p className="text-gray-600 font-medium">Parsing your book...</p>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-gray-400" />
            <div className="text-center">
              <p className="text-gray-600 font-medium">
                Drop your epub here, or click to browse
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Supports .epub files
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-4 text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
