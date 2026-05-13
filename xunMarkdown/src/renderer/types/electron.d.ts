export interface ElectronAPI {
  openFileDialog: () => Promise<{ success: boolean; filePath?: string }>;
  openFolderDialog: () => Promise<{ success: boolean; folderPath?: string }>;
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  saveFileDialog: (defaultName?: string) => Promise<{ success: boolean; filePath?: string }>;
  listFiles: (folderPath: string) => Promise<{ success: boolean; files?: Array<{ name: string; path: string; isDirectory: boolean }>; error?: string }>;
  createFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  createDirectory: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
  renameItem: (oldPath: string, newPath: string) => Promise<{ success: boolean; error?: string }>;
  deleteItem: (itemPath: string) => Promise<{ success: boolean; error?: string }>;
  saveImage: (dataUrl: string, savePath: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  exportHtml: (content: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  exportPdf: (content: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  getSettings: () => Promise<{
    theme: string;
    autoSave: boolean;
    shortcuts: Record<string, string>;
    aiSettings: { enabled: boolean; [key: string]: unknown };
  }>;
  saveSettings: (settings: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  showItemInFolder: (itemPath: string) => Promise<{ success: boolean }>;
  openExternal: (url: string) => Promise<{ success: boolean }>;
  searchFiles: (
    folderPath: string, 
    query: string, 
    options?: { caseSensitive?: boolean; regex?: boolean }
  ) => Promise<{
    success: boolean;
    results?: Array<{
      path: string;
      name: string;
      matches: Array<{ line: number; content: string }>;
    }>;
    error?: string;
  }>;
  onFileOpened: (callback: (filePath: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
