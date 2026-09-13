import React, { createContext, useContext, useState } from "react";

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  language?: string;
  content?: string;
  children?: FileNode[];
}

export interface EditorTab {
  id: string;
  name: string;
  language: string;
  content: string;
  path: string;
}

const initialFileTree: FileNode = {
  id: "root",
  name: "data-center",
  type: "folder",
  path: "/data-center",
  children: [
    {
      id: "src",
      name: "src",
      type: "folder",
      path: "/data-center/src",
      children: [
        {
          id: "app",
          name: "App.tsx",
          type: "file",
          path: "/data-center/src/App.tsx",
          language: "typescript",
          content: `export default function App() {\n  return <div>Data Center</div>;\n}`,
        },
      ],
    },
    {
      id: "package",
      name: "package.json",
      type: "file",
      path: "/data-center/package.json",
      language: "json",
      content: `{\n  "name": "data-center",\n  "version": "1.0.0"\n}`,
    },
  ],
};

interface EditorContextType {
  fileTree: FileNode;
  tabs: EditorTab[];
  activeTabId: string | null;
  openFile: (file: FileNode) => void;
  closeTab: (tabId: string) => void;
  setActiveTabId: (id: string) => void;
  createNode: (parentId: string, name: string, type: "file" | "folder") => void;
  deleteNode: (nodeId: string) => void;
  moveNode: (draggedId: string, targetFolderId: string) => void;
  updateTabContent: (tabId: string, newContent: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fileTree, setFileTree] = useState<FileNode>(initialFileTree);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openFile = (file: FileNode) => {
    if (file.type !== "file") return;
    const existingTab = tabs.find((t) => t.id === file.id);
    if (!existingTab) {
      const newTab: EditorTab = {
        id: file.id,
        name: file.name,
        language: file.language || "plaintext",
        content: file.content || "",
        path: file.path,
      };
      setTabs((prev) => [...prev, newTab]);
    }
    setActiveTabId(file.id);
  };

  const closeTab = (tabId: string) => {
    const nextTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(nextTabs);
    if (activeTabId === tabId) {
      setActiveTabId(nextTabs.length > 0 ? nextTabs[nextTabs.length - 1].id : null);
    }
  };

  const updateTabContent = (tabId: string, newContent: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, content: newContent } : tab))
    );
  };

  const createNode = (parentId: string, name: string, type: "file" | "folder") => {
    const ext = name.split(".").pop()?.toLowerCase();
    let lang = "plaintext";
    if (ext === "ts" || ext === "tsx") lang = "typescript";
    if (ext === "json") lang = "json";
    if (ext === "md") lang = "markdown";

    const newNode: FileNode = {
      id: `node-${Date.now()}`,
      name,
      type,
      path: `/${name}`,
      language: lang,
      content: type === "file" ? "" : undefined,
      children: type === "folder" ? [] : undefined,
    };

    const addRecursive = (node: FileNode): FileNode => {
      if (node.id === parentId && node.type === "folder") {
        return { ...node, children: [...(node.children || []), newNode] };
      }
      if (node.children) {
        return { ...node, children: node.children.map(addRecursive) };
      }
      return node;
    };

    setFileTree((prev) => addRecursive(prev));
  };

  const deleteNode = (nodeId: string) => {
    const deleteRecursive = (node: FileNode): FileNode | null => {
      if (node.id === nodeId) return null;
      if (node.children) {
        return {
          ...node,
          children: node.children.map(deleteRecursive).filter(Boolean) as FileNode[],
        };
      }
      return node;
    };
    const updated = deleteRecursive(fileTree);
    if (updated) setFileTree(updated);
    closeTab(nodeId);
  };

  // Drag and Drop વડે File/Folder ખસેડવાની પદ્ધતિ
  const moveNode = (draggedId: string, targetFolderId: string) => {
    if (draggedId === targetFolderId) return;

    let targetNode: FileNode | null = null;
    let targetParent: FileNode | null = null;

    // ૧. પહેલા Target Item શોધી લેવી (જેથી ખબર પડે કે તે Folder છે કે File)
    const findNode = (node: FileNode, parent: FileNode | null) => {
      if (node.id === targetFolderId) {
        targetNode = node;
        targetParent = parent;
      }
      if (node.children) {
        node.children.forEach((child) => findNode(child, node));
      }
    };
    findNode(fileTree, null);

    // જો Drop કોઈ ફાઈલ પર કર્યું હોય, તો તે ફાઈલના પેરેન્ટ ફોલ્ડરને Target બનાવવું
    const finalTargetId =
      targetNode && (targetNode as FileNode).type === "folder"
        ? targetFolderId
        : targetParent
        ? (targetParent as FileNode).id
        : "root";

    if (draggedId === finalTargetId) return;

    let draggedItem: FileNode | null = null;

    // ૨. Drag કરેલી આઇટમ વૃક્ષમાંથી દૂર કરવી
    const removeRecursive = (node: FileNode): FileNode | null => {
      if (node.id === draggedId) {
        draggedItem = node;
        return null;
      }
      if (node.children) {
        return {
          ...node,
          children: node.children
            .map(removeRecursive)
            .filter(Boolean) as FileNode[],
        };
      }
      return node;
    };

    // ૩. Drag કરેલી આઇટમને નવા Target Folder માં Insert કરવી
    const insertRecursive = (node: FileNode): FileNode => {
      if (node.id === finalTargetId && node.type === "folder") {
        return {
          ...node,
          children: [...(node.children || []), draggedItem!],
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(insertRecursive),
        };
      }
      return node;
    };

    setFileTree((prev) => {
      const treeWithoutDragged = removeRecursive(prev);
      if (!treeWithoutDragged || !draggedItem) return prev;
      return insertRecursive(treeWithoutDragged);
    });
  };

  return (
    <EditorContext.Provider
      value={{
        fileTree,
        tabs,
        activeTabId,
        openFile,
        closeTab,
        setActiveTabId,
        createNode,
        deleteNode,
        moveNode,
        updateTabContent,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used within an EditorProvider");
  return context;
};