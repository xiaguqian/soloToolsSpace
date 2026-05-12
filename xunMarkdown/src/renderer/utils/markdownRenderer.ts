import { marked } from 'marked';
import katex from 'katex';
import mermaid from 'mermaid';

const emojiMap: Record<string, string> = {
  ':smile:': '😊',
  ':laughing:': '😆',
  ':blush:': '😊',
  ':wink:': '😉',
  ':heart_eyes:': '😍',
  ':kissing_heart:': '😘',
  ':yum:': '😋',
  ':stuck_out_tongue:': '😛',
  ':sunglasses:': '😎',
  ':cry:': '😢',
  ':sob:': '😭',
  ':angry:': '😠',
  ':flushed:': '😳',
  ':open_mouth:': '😮',
  ':neutral_face:': '😐',
  ':confused:': '😕',
  ':fearful:': '😨',
  ':cold_sweat:': '😰',
  ':scream:': '😱',
  ':rage:': '😡',
  ':pensive:': '😔',
  ':disappointed:': '😞',
  ':tired_face:': '😩',
  ':persevere:': '😣',
  ':joy:': '😂',
  ':astonished:': '😲'
};

const replaceEmojis = (text: string): string => {
  return text.replace(/:[a-z_]+:/g, match => emojiMap[match] || match);
};

const highlightRenderer = {
  text: (text: string) => {
    return replaceEmojis(text).replace(/==([^=]+)==/g, '<mark>$1</mark>');
  }
};

marked.use({
  renderer: highlightRenderer
});

const renderer = new marked.Renderer();
const originalParagraph = renderer.paragraph.bind(renderer);

renderer.paragraph = (text: string) => {
  if (text.startsWith('\\(') && text.endsWith('\\)')) {
    try {
      const math = text.slice(2, -2);
      return katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch (e) {
      return originalParagraph(text);
    }
  }
  return originalParagraph(text);
};

marked.use({ renderer });

export const renderMarkdown = async (markdown: string): Promise<string> => {
  let html = marked.parse(markdown) as string;
  
  const inlineMathRegex = /\\\(([^\\]+?)\\\)/g;
  html = html.replace(inlineMathRegex, (_match, equation: string) => {
    try {
      return katex.renderToString(equation, { displayMode: false, throwOnError: false });
    } catch (e) {
      return `\\(${equation}\\)`;
    }
  });
  
  const blockMathRegex = /\\\[([\\s\\S]+?)\\\]/g;
  html = html.replace(blockMathRegex, (_match, equation: string) => {
    try {
      return `<div class="math-block">${katex.renderToString(equation, { displayMode: true, throwOnError: false })}</div>`;
    } catch (e) {
      return `\\[${equation}\\]`;
    }
  });
  
  const mermaidRegex = /```mermaid\n([\s\S]+?)\n```/g;
  let mermaidIndex = 0;
  const mermaidDiagrams: Array<{ id: string; code: string }> = [];
  
  html = html.replace(mermaidRegex, (_match, code: string) => {
    const id = `mermaid-diagram-${mermaidIndex++}`;
    mermaidDiagrams.push({ id, code });
    return `<div class="mermaid" id="${id}">${code}</div>`;
  });
  
  if (mermaidDiagrams.length > 0) {
    try {
      mermaid.initialize({ startOnLoad: false, theme: 'default' });
      const processedDiagrams: Array<{ id: string; svg: string }> = [];
      
      for (const diagram of mermaidDiagrams) {
        try {
          const { svg } = await mermaid.render(diagram.id, diagram.code);
          processedDiagrams.push({ id: diagram.id, svg });
        } catch (e) {
          processedDiagrams.push({ 
            id: diagram.id, 
            svg: `<div class="mermaid-error">Mermaid diagram error: ${(e as Error).message}</div>` 
          });
        }
      }
      
      processedDiagrams.forEach(({ id, svg }) => {
        html = html.replace(
          `<div class="mermaid" id="${id}">${mermaidDiagrams.find(d => d.id === id)?.code || ''}</div>`,
          `<div class="mermaid-svg">${svg}</div>`
        );
      });
    } catch (e) {
      console.error('Mermaid initialization error:', e);
    }
  }
  
  return html;
};

export const extractOutline = (markdown: string): Array<{ level: number; text: string; id: string }> => {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const outline: Array<{ level: number; text: string; id: string }> = [];
  let match: RegExpExecArray | null;
  
  while ((match = headingRegex.exec(markdown)) !== null) {
    outline.push({
      level: match[1].length,
      text: match[2],
      id: match[2].toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    });
  }
  
  return outline;
};

export const applyFormat = (
  text: string, 
  selectionStart: number, 
  selectionEnd: number, 
  format: 'bold' | 'italic' | 'code' | 'strikethrough' | 'quote' | 'code-block'
): { newText: string; newStart: number; newEnd: number } => {
  const selectedText = text.slice(selectionStart, selectionEnd);
  let prefix = '';
  let suffix = '';
  let insertText = '';
  
  switch (format) {
    case 'bold':
      prefix = '**';
      suffix = '**';
      insertText = selectedText || '粗体文本';
      break;
    case 'italic':
      prefix = '*';
      suffix = '*';
      insertText = selectedText || '斜体文本';
      break;
    case 'code':
      prefix = '`';
      suffix = '`';
      insertText = selectedText || '代码';
      break;
    case 'strikethrough':
      prefix = '~~';
      suffix = '~~';
      insertText = selectedText || '删除线';
      break;
    case 'quote':
      prefix = '> ';
      suffix = '';
      insertText = selectedText || '引用文本';
      break;
    case 'code-block':
      prefix = '\n```\n';
      suffix = '\n```\n';
      insertText = selectedText || '代码块';
      break;
  }
  
  const newText = text.slice(0, selectionStart) + prefix + insertText + suffix + text.slice(selectionEnd);
  const newStart = selectionStart + prefix.length;
  const newEnd = selectionStart + prefix.length + insertText.length;
  
  return { newText, newStart, newEnd };
};

export const applyHeading = (
  text: string,
  selectionStart: number,
  selectionEnd: number,
  level: 1 | 2 | 3 | 4 | 5 | 6
): { newText: string; newStart: number; newEnd: number } => {
  const beforeCursor = text.slice(0, selectionStart);
  const lineStartIndex = beforeCursor.lastIndexOf('\n') + 1;
  const currentLine = text.slice(lineStartIndex, selectionEnd);
  
  const hashes = '#'.repeat(level) + ' ';
  const existingHeadingMatch = currentLine.match(/^#{1,6}\s/);
  
  let newText: string;
  let newStart: number;
  let newEnd: number;
  
  if (existingHeadingMatch) {
    const existingHashes = existingHeadingMatch[0];
    newText = 
      text.slice(0, lineStartIndex) + 
      hashes + 
      currentLine.slice(existingHashes.length) + 
      text.slice(selectionEnd);
    newStart = lineStartIndex + hashes.length;
    newEnd = newStart + currentLine.length - existingHashes.length;
  } else {
    newText = 
      text.slice(0, lineStartIndex) + 
      hashes + 
      currentLine + 
      text.slice(selectionEnd);
    newStart = lineStartIndex + hashes.length;
    newEnd = newStart + currentLine.length;
  }
  
  return { newText, newStart, newEnd };
};

export const applyList = (
  text: string,
  selectionStart: number,
  selectionEnd: number,
  type: 'bullet' | 'numbered' | 'task'
): { newText: string; newStart: number; newEnd: number } => {
  const beforeCursor = text.slice(0, selectionStart);
  const lineStartIndex = beforeCursor.lastIndexOf('\n') + 1;
  const currentLine = text.slice(lineStartIndex, selectionEnd);
  
  let prefix: string;
  switch (type) {
    case 'bullet':
      prefix = '- ';
      break;
    case 'numbered':
      prefix = '1. ';
      break;
    case 'task':
      prefix = '- [ ] ';
      break;
  }
  
  const newText = 
    text.slice(0, lineStartIndex) + 
    prefix + 
    currentLine + 
    text.slice(selectionEnd);
  const newStart = lineStartIndex + prefix.length;
  const newEnd = newStart + currentLine.length;
  
  return { newText, newStart, newEnd };
};

export const insertTable = (
  text: string,
  selectionStart: number,
  rows: number = 3,
  cols: number = 3
): { newText: string; newStart: number; newEnd: number } => {
  const tableLines: string[] = [];
  
  tableLines.push('| ' + Array(cols).fill(' 头部 ').join(' | ') + ' |');
  tableLines.push('| ' + Array(cols).fill(' --- ').join(' | ') + ' |');
  
  for (let i = 0; i < rows - 1; i++) {
    tableLines.push('| ' + Array(cols).fill(' 内容 ').join(' | ') + ' |');
  }
  
  const tableText = '\n' + tableLines.join('\n') + '\n';
  const newText = text.slice(0, selectionStart) + tableText + text.slice(selectionStart);
  const newStart = selectionStart + 1;
  const newEnd = selectionStart + tableText.length - 1;
  
  return { newText, newStart, newEnd };
};

export const insertLink = (
  text: string,
  selectionStart: number,
  selectionEnd: number,
  url: string = 'https://',
  altText?: string
): { newText: string; newStart: number; newEnd: number } => {
  const selectedText = text.slice(selectionStart, selectionEnd);
  const linkText = altText || selectedText || '链接文字';
  const linkMarkdown = `[${linkText}](${url})`;
  
  const newText = text.slice(0, selectionStart) + linkMarkdown + text.slice(selectionEnd);
  const newStart = selectionStart + 1;
  const newEnd = selectionStart + 1 + linkText.length;
  
  return { newText, newStart, newEnd };
};

export const insertImage = (
  text: string,
  selectionStart: number,
  selectionEnd: number,
  imagePath: string,
  altText: string = '图片'
): { newText: string; newStart: number; newEnd: number } => {
  const selectedText = text.slice(selectionStart, selectionEnd);
  const imageMarkdown = `![${altText || selectedText}](${imagePath})`;
  
  const newText = text.slice(0, selectionStart) + imageMarkdown + text.slice(selectionEnd);
  const newStart = selectionStart;
  const newEnd = selectionStart + imageMarkdown.length;
  
  return { newText, newStart, newEnd };
};
