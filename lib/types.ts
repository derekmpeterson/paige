export interface BookChapter {
  id: string;
  title: string;
  text: string;
  charOffset: number;
  charLength: number;
  tokenCount: number;
}

export interface ParsedBook {
  title: string;
  author: string;
  totalCharacters: number;
  totalTokens: number;
  chapters: BookChapter[];
}

export interface BookMetaChapter {
  id: string;
  title: string;
  charOffset: number;
  charLength: number;
  tokenCount: number;
}

export interface BookMeta {
  bookId: string;
  title: string;
  author: string;
  totalCharacters: number;
  totalTokens: number;
  chapters: BookMetaChapter[];
}

export interface ChatMessageMetadata {
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cachedTokens?: number; // input tokens served from the provider's cache
  };
  cost?: number; // USD (provider-reported when available, otherwise estimated)
}
