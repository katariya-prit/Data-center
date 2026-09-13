import React, { useState, useEffect } from "react";
import {
  VscChevronRight,
  VscChevronDown,
  VscFolder,
  VscFolderOpened,
  VscFile,
  VscJson,
  VscCode,
  VscMarkdown,
  VscNewFile,
  VscNewFolder,
  VscRefresh,
  VscTrash,
} from "react-icons/vsc";
import { useEditor, type FileNode } from "../../../context/EditorContext";

function FileIcon({ node }: { node: FileNode }) {
  if (node.type === "folder") return null;
  if (node.language === "json") return <VscJson size={14} className="shrink-0 text-[#8ab4f8]" />;
  if (node.language === "typescript") return <VscCode size={14} className="shrink-0 text-[#6cb6ff]" />;
  if (node.language === "markdown") return <VscMarkdown size={14} className="shrink-0 text-[#a8b3c7]" />;
  return <VscFile size={14} className="shrink-0 text-[#8b95a7]" />;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  node: FileNode | null;
}

function TreeNode({
  node,
  level = 0,
  onContextMenu,
}: {
  node: FileNode;
  level?: number;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
}) {
  const [expanded, setExpanded] = useState(level === 0);
  const [isDragOver, setIsDragOver] = useState(false);
  const { openFile, activeTabId, deleteNode, moveNode } = useEditor();

  const isSelected = activeTabId === node.id;

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData("text/plain", node.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId) {
      moveNode(draggedId, node.id);
    }
  };

  if (node.type === "folder") {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          draggable
          onDragStart={handleDragStart}
          onClick={() => setExpanded(!expanded)}
          onContextMenu={(e) => onContextMenu(e, node)}
          className={`group flex cursor-pointer items-center justify-between rounded-md py-1 px-2 text-[12px] text-(--color-text-muted) transition-colors hover:bg-[#1d202b] hover:text-(--color-text) ${
            isDragOver ? "bg-[#28324a] border border-dashed border-[#6cb6ff]" : ""
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          <div className="flex items-center gap-1.5 truncate">
            {expanded ? <VscChevronDown size={13} /> : <VscChevronRight size={13} />}
            {expanded ? (
              <VscFolderOpened size={15} className="text-[#d9b66f]" />
            ) : (
              <VscFolder size={15} className="text-[#d9b66f]" />
            )}
            <span className="truncate">{node.name}</span>
          </div>
        </div>
        {expanded &&
          node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onContextMenu={onContextMenu}
            />
          ))}
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => openFile(node)}
      onContextMenu={(e) => onContextMenu(e, node)}
      className={`group flex cursor-pointer items-center justify-between rounded-md py-1 px-2 text-[12px] transition-all ${
        isSelected
          ? "bg-[#202636] text-(--color-text) font-medium"
          : "text-(--color-text-muted) hover:bg-[#1d202b] hover:text-(--color-text)"
      } ${isDragOver ? "bg-[#28324a] border border-dashed border-[#6cb6ff]" : ""}`}
      style={{ paddingLeft: `${level * 12 + 20}px` }}
    >
      <div className="flex items-center gap-2 truncate">
        <FileIcon node={node} />
        <span className="truncate">{node.name}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteNode(node.id);
        }}
        className="opacity-0 group-hover:opacity-100 text-[#8b95a7] hover:text-red-400"
      >
        <VscTrash size={13} />
      </button>
    </div>
  );
}

export default function CodeEditorSidebar() {
  const { fileTree, createNode, deleteNode } = useEditor();
  const [refreshKey, setRefreshKey] = useState(0);

  // Context Menu State
  const [menuState, setMenuState] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });

  // Right Click Event Handler
  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuState({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node,
    });
  };

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = () => setMenuState((prev) => ({ ...prev, visible: false }));
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleCreateFile = (targetFolderId = "root") => {
    const fileName = prompt("Enter file name (e.g., test.ts):");
    if (fileName) createNode(targetFolderId, fileName, "file");
  };

  const handleCreateFolder = (targetFolderId = "root") => {
    const folderName = prompt("Enter folder name:");
    if (folderName) createNode(targetFolderId, folderName, "folder");
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#151721] p-2 text-[#c8ced8] select-none">
      {/* Top Header Icons */}
      <div className="flex items-center justify-between px-2 py-1 mb-2 border-b border-[#282c3a]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-(--color-text-muted)">
          Explorer
        </span>
        <div className="flex items-center gap-2 text-[#8b95a7]">
          <button
            onClick={() => handleCreateFile("root")}
            title="New File"
            className="hover:text-white transition-colors"
          >
            <VscNewFile size={15} />
          </button>
          <button
            onClick={() => handleCreateFolder("root")}
            title="New Folder"
            className="hover:text-white transition-colors"
          >
            <VscNewFolder size={15} />
          </button>
          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            title="Refresh Explorer"
            className="hover:text-white transition-colors"
          >
            <VscRefresh size={15} />
          </button>
        </div>
      </div>

      {/* Dynamic File Tree */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <TreeNode
          key={refreshKey}
          node={fileTree}
          level={0}
          onContextMenu={handleContextMenu}
        />
      </div>

      {/* VS Code Style Right-Click Context Menu */}
      {menuState.visible && (
        <div
          className="fixed z-50 min-w-37.5 rounded-md border border-[#282c3a] bg-[#1c1f2b] py-1 shadow-lg text-[12px] text-[#c8ced8]"
          style={{ top: `${menuState.y}px`, left: `${menuState.x}px` }}
        >
          {menuState.node?.type === "folder" && (
            <>
              <button
                onClick={() => handleCreateFile(menuState.node!.id)}
                className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-[#28324a] hover:text-white"
              >
                <VscNewFile size={14} /> New File...
              </button>
              <button
                onClick={() => handleCreateFolder(menuState.node!.id)}
                className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-[#28324a] hover:text-white"
              >
                <VscNewFolder size={14} /> New Folder...
              </button>
              <div className="my-1 border-t border-[#282c3a]" />
            </>
          )}

          {menuState.node?.id !== "root" && (
            <button
              onClick={() => deleteNode(menuState.node!.id)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-red-400 hover:bg-[#28324a] hover:text-red-300"
            >
              <VscTrash size={14} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}