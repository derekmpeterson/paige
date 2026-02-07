export interface BookChapter {
  id: string;
  title: string;
  text: string;
  charOffset: number;
  charLength: number;
}

export interface ParsedBook {
  title: string;
  author: string;
  totalCharacters: number;
  chapters: BookChapter[];
}
