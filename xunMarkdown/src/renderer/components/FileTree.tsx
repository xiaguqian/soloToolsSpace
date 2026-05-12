import React, { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { workspacePathState, fileTreeState, FileNode, tabsState, activeTabIdState } from '../state/atoms';
import './FileTree.css';

const getDirname = (filePath: string): string => {
  const separator = filePath.includes('/') ? '/' : '\\';
  const parts = filePath.split(separator);
  parts.pop();
  return parts.join(separator);
};

const joinPath = (...parts: string[]): string => {
  const separator = parts[0]?.includes('/') ? '/' : '\\';
  return parts.filter(Boolean).join(separator).replace(/[\\/]+/g, separator);
};

const getBasename = (filePath: string): string => {
  const separator = filePath.includes('/') ? '/' : '\\';
  const parts = filePath.split(separator);
  return parts[parts.length - 1] || '';
};

const FileTree: React.FC = () => {
  const workspacePath = useRecoilValue(workspacePathState);
  const [fileTree, setFileTree] = useRecoilState(fileTreeState);
  const [tabs, setTabs] = useRecoilState(tabsState);
  const [activeTabId, setActiveTabId] = useRecoilState(activeTabIdState);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set([workspacePath || '']));
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; item: FileNode | null; isRoot: boolean }>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
    isRoot: false
  });

  const toggleExpand = (dirPath: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(dirPath)) {
      newExpanded.delete(dirPath);
    } else {
      newExpanded.add(dirPath);
    }
    setExpandedDirs(newExpanded);
  };

  const loadDirectory = async (dirPath: string) => {
    const result = await window.electronAPI.listFiles(dirPath);
    if (result.success && result.files) {
      const nodes: FileNode[] = result.files.map(f => ({
        name: f.name,
        path: f.path,
        isDirectory: f.isDirectory
      }));
      return nodes;
    }
    return [];
  };

  const updateTreeForPath = (nodes: FileNode[], targetPath: string, children: FileNode[]): FileNode[] => {
    return nodes.map(node => {
      if (node.path === targetPath) {
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: updateTreeForPath(node.children, targetPath, children) };
      }
      return node;
    });
  };

  const handleFileClick = async (fileNode: FileNode) => {
    if (fileNode.isDirectory) {
      toggleExpand(fileNode.path);
      if (!fileNode.children) {
        const children = await loadDirectory(fileNode.path);
        setFileTree(prev => updateTreeForPath(prev, fileNode.path, children));
      }
    } else {
      const existingTab = tabs.find(t => t.filePath === fileNode.path);
      if (existingTab) {
        setActiveTabId(existingTab.id);
      } else {
        const result = await window.electronAPI.readFile(fileNode.path);
        if (result.success) {
          const newTab = {
            id: `tab-${Date.now()}`,
            filePath: fileNode.path,
            fileName: fileNode.name,
            content: result.content || '',
            isModified: false,
            cursorPosition: { line: 0, column: 0 }
          };
          setTabs(prev => [...prev, newTab]);
          setActiveTabId(newTab.id);
        }
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: FileNode | null = null, isRoot: boolean = false) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
      isRoot
    });
  };

  const handleCreateFile = async () => {
    const parentDir = contextMenu.item?.isDirectory ? contextMenu.item.path : 
                      contextMenu.item ? getDirname(contextMenu.item.path) : 
                      workspacePath;
    
    if (parentDir) {
      const fileName = prompt('输入文件名:')?.trim();
      if (fileName) {
        const filePath = joinPath(parentDir, fileName.endsWith('.md') ? fileName : `${fileName}.md`);
        await window.electronAPI.createFile(filePath);
        refreshTree();
      }
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleCreateDirectory = async () => {
    const parentDir = contextMenu.item?.isDirectory ? contextMenu.item.path : 
                      contextMenu.item ? getDirname(contextMenu.item.path) : 
                      workspacePath;
    
    if (parentDir) {
      const dirName = prompt('输入文件夹名:')?.trim();
      if (dirName) {
        const dirPath = joinPath(parentDir, dirName);
        await window.electronAPI.createDirectory(dirPath);
        refreshTree();
      }
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleRename = async () => {
    if (contextMenu.item) {
      const newName = prompt('输入新名称:', contextMenu.item.name)?.trim();
      if (newName && newName !== contextMenu.item.name) {
        const newPath = joinPath(getDirname(contextMenu.item.path), newName);
        await window.electronAPI.renameItem(contextMenu.item.path, newPath);
        refreshTree();
      }
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleDelete = async () => {
    if (contextMenu.item) {
      if (confirm(`确定要删除 "${contextMenu.item.name}" 吗?`)) {
        await window.electronAPI.deleteItem(contextMenu.item.path);
        refreshTree();
      }
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const refreshTree = async () => {
    if (workspacePath) {
      const nodes = await loadDirectory(workspacePath);
      setFileTree(nodes);
    }
  };

  const renderTree = (nodes: FileNode[], depth: number = 0): React.ReactNode => {
    return nodes.map(node => (
      <div key={node.path}>
        <div 
          className={`file-tree-item ${node.isDirectory ? 'directory' : 'file'} ${activeTabId && tabs.find(t => t.filePath === node.path) ? 'active' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleFileClick(node)}
          onContextMenu={(e) => handleContextMenu(e, node)}
        >
          <span className="tree-icon">
            {node.isDirectory ? (expandedDirs.has(node.path) ? '📂' : '📁') : '📄'}
          </span>
          <span className="tree-name">{node.name}</span>
        </div>
        {node.isDirectory && expandedDirs.has(node.path) && node.children && (
          <div className="directory-children">
            {renderTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div 
      className="file-tree"
      onClick={() => setContextMenu({ ...contextMenu, visible: false })}
    >
      {workspacePath ? (
        <>
          <div 
            className="workspace-header"
            onContextMenu={(e) => handleContextMenu(e, null, true)}
          >
            <span>📁 {getBasename(workspacePath)}</span>
            <button className="refresh-btn" onClick={refreshTree} title="刷新">🔄</button>
          </div>
          <div className="file-tree-content">
            {fileTree.length > 0 ? (
              renderTree(fileTree)
            ) : (
              <div className="empty-tree">
                <p>工作区为空</p>
                <button onClick={handleCreateFile} className="create-btn">
                  创建新文件
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="no-workspace">
          <p>未打开工作区</p>
          <button 
            className="open-workspace-btn"
            onClick={async () => {
              const result = await window.electronAPI.openFolderDialog();
              if (result.success && result.folderPath) {
                // 这个会在App.tsx中处理
              }
            }}
          >
            打开文件夹
          </button>
        </div>
      )}

      {contextMenu.visible && (
        <div 
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button className="context-menu-item" onClick={handleCreateFile}>
            新建文件
          </button>
          <button className="context-menu-item" onClick={handleCreateDirectory}>
            新建文件夹
          </button>
          {contextMenu.item && (
            <>
              <div className="context-menu-separator" />
              <button className="context-menu-item" onClick={handleRename}>
                重命名
              </button>
              <button className="context-menu-item danger" onClick={handleDelete}>
                删除
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FileTree;
