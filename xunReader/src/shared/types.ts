export interface Book {
  id: string;
  title: string;
  cover?: string;
  author?: string;
  description?: string;
  isCompleted?: boolean;
  lastUpdate?: string;
  path?: string;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  index: number;
}

export interface Bookshelf {
  id: string;
  name: string;
  isDefault: boolean;
  books: Book[];
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  bookId: string;
  title: string;
  cover?: string;
  author?: string;
  lastReadAt?: string;
  readCount: number;
  createdAt: string;
}

export interface Bookstore {
  id: string;
  name: string;
  books: Book[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
}

export interface AIParseResult {
  type: 'book' | 'bookstore' | 'chapter';
  data: Book | Bookstore | { book: Book; chapter: Chapter };
}
