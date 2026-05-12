interface ElectronAPI {
  getBookshelf: () => Promise<any>;
  addBookToShelf: (book: any, shelfId: string) => Promise<any>;
  removeBookFromShelf: (bookId: string, shelfId: string) => Promise<boolean>;
  getHistory: () => Promise<any>;
  addToHistory: (book: any) => Promise<boolean>;
  removeFromHistory: (bookId: string) => Promise<boolean>;
  callApi: (endpoint: string, data: any) => Promise<any>;
  getEnvironment: () => Promise<string>;
  setEnvironment: (env: string) => Promise<boolean>;
  getDeviceId: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
