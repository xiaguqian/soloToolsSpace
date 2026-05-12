import { atom } from 'recoil';

export type EditorMode = 'wysiwyg' | 'source' | 'split';
export type Theme = 'light' | 'dark';

export interface Tab {
  id: string;
  filePath: string | null;
  fileName: string;
  content: string;
  isModified: boolean;
  cursorPosition: { line: number; column: number };
}

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

export const workspacePathState = atom<string | null>({
  key: 'workspacePathState',
  default: null
});

export const fileTreeState = atom<FileNode[]>({
  key: 'fileTreeState',
  default: []
});

export const tabsState = atom<Tab[]>({
  key: 'tabsState',
  default: [{
    id: 'tab-1',
    filePath: null,
    fileName: 'untitled.md',
    content: '',
    isModified: false,
    cursorPosition: { line: 0, column: 0 }
  }]
});

export const activeTabIdState = atom<string>({
  key: 'activeTabIdState',
  default: 'tab-1'
});

export const editorModeState = atom<EditorMode>({
  key: 'editorModeState',
  default: 'split'
});

export const themeState = atom<Theme>({
  key: 'themeState',
  default: 'light'
});

export const focusModeState = atom<boolean>({
  key: 'focusModeState',
  default: false
});

export const outlineVisibleState = atom<boolean>({
  key: 'outlineVisibleState',
  default: true
});

export const sidebarVisibleState = atom<boolean>({
  key: 'sidebarVisibleState',
  default: true
});

export const searchQueryState = atom<string>({
  key: 'searchQueryState',
  default: ''
});

export const searchResultsState = atom<Array<{
  path: string;
  name: string;
  matches: Array<{ line: number; content: string }>;
}>>({
  key: 'searchResultsState',
  default: []
});

export const aiSettingsState = atom<{
  enabled: boolean;
  provider: 'openai' | 'custom' | 'self-hosted';
  apiKey: string;
  baseUrl: string;
  model: string;
}>({
  key: 'aiSettingsState',
  default: {
    enabled: false,
    provider: 'openai',
    apiKey: '',
    baseUrl: '',
    model: 'gpt-3.5-turbo'
  }
});

export const shortcutsState = atom<Record<string, string>>({
  key: 'shortcutsState',
  default: {
    'save': 'Ctrl+S',
    'save-as': 'Ctrl+Shift+S',
    'open': 'Ctrl+O',
    'new-file': 'Ctrl+N',
    'bold': 'Ctrl+B',
    'italic': 'Ctrl+I',
    'heading-1': 'Ctrl+1',
    'heading-2': 'Ctrl+2',
    'heading-3': 'Ctrl+3',
    'list': 'Ctrl+L',
    'toggle-focus-mode': 'Ctrl+Shift+F',
    'toggle-sidebar': 'Ctrl+B',
    'toggle-outline': 'Ctrl+Shift+O',
    'search': 'Ctrl+F',
    'replace': 'Ctrl+H',
    'global-search': 'Ctrl+Shift+F'
  }
});
