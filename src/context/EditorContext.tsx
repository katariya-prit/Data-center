import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  getExplorerTreeRequest,
  getFileContentRequest,
  createNodeRequest,
  deleteNodeRequest,
  type FileNode as ApiFileNode,
  updateFileContentRequest,
} from "../service/explorer_service";
import {
  saveToIndexedDB,
  getIndexedDBNodes,
  updateIndexedDBNodeContent,
  removeIndexedDBNode,
  queuePendingOp,
  type FileNodeLite,
} from "../system/db";
import { useSync } from "../system/sync/SyncContext";
import { pathSystem } from "../system/path";

export interface FileNode extends ApiFileNode {
  content?: string;
}

export interface EditorTab {
  id: string;
  nodeId: string;
  contentId: string | null;
  name: string;
  language: string;
  content: string;
  path: string;
  isDirty: boolean;
  isSaving: boolean;
}

interface EditorContextType {
  diskId: string;
  fileTree: FileNode;
  isTreeLoading: boolean;
  tabs: EditorTab[];
  activeTabId: string | null;
  revealPath: string | null;
  expandedPaths: Set<string>;
  toggleFolderExpand: (path: string) => void;
  openFile: (file: FileNode) => void;
  openFolder: (folder: FileNode) => Promise<void>;
  closeTab: (tabId: string) => void;
  setActiveTabId: (id: string) => void;
  createNode: (parentId: string, name: string, type: "file" | "folder") => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  moveNode: (draggedId: string, targetFolderId: string) => void;
  updateTabContent: (tabId: string, newContent: string) => void;
  refreshTree: () => Promise<void>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

function findNodeById(node: FileNode, id: string): FileNode | null {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findNodeById(child as FileNode, id);
    if (found) return found;
  }
  return null;
}

function getAncestorPaths(path: string): string[] {
  return pathSystem.breadcrumbs(path).map((c) => c.path);
}

function flattenRemoteTree(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  const walk = (list: FileNode[]) => {
    for (const node of list) {
      result.push(node);
      if (node.children && node.children.length) {
        walk(node.children as FileNode[]);
      }
    }
  };
  walk(nodes);
  return result;
}

function buildFileTree(
  diskId: string,
  remoteRoots: FileNode[],
  localNodes: FileNodeLite[]
): FileNode {
  const map = new Map<string, FileNode>();

  for (const n of flattenRemoteTree(remoteRoots)) {
    map.set(n.id, { ...n, children: n.type === "folder" ? [] : undefined });
  }
  for (const n of localNodes) {
    map.set(n.id, { ...(n as FileNode), children: n.type === "folder" ? [] : undefined });
  }

  const rootChildren: FileNode[] = [];
  for (const node of map.values()) {
    const parentId = node.parentId;
    if (parentId && map.has(parentId)) {
      const parent = map.get(parentId)!;
      parent.children = parent.children ? [...parent.children, node] : [node];
    } else {
      rootChildren.push(node);
    }
  }

  return {
    id: "root",
    diskId,
    parentId: null,
    contentId: null,
    name: "root",
    type: "folder",
    path: "/",
    children: rootChildren,
  };
}

function removeNodeFromTree(tree: FileNode, nodeId: string): FileNode {
  if (!tree.children) return tree;
  return {
    ...tree,
    children: tree.children
      .filter((child) => child.id !== nodeId)
      .map((child) => removeNodeFromTree(child as FileNode, nodeId)),
  };
}

export const EditorProvider: React.FC<{ diskId: string; children: React.ReactNode }> = ({
  diskId,
  children,
}) => {
  const [fileTree, setFileTree] = useState<FileNode>({
    id: "root",
    diskId,
    parentId: null,
    contentId: null,
    name: "root",
    type: "folder",
    path: "/",
    children: [],
  });
  const [isTreeLoading, setIsTreeLoading] = useState(false);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [revealPath, setRevealPath] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const refreshTree = useCallback(async () => {
    if (!diskId) return;
    setIsTreeLoading(true);
    try {
      const [res, localNodes] = await Promise.all([
        getExplorerTreeRequest(diskId),
        getIndexedDBNodes(),
      ]);
      const remoteRoots = (res.success ? res.tree : []) as FileNode[];
      setFileTree(buildFileTree(diskId, remoteRoots, localNodes));
    } catch (err) {
      console.error("Tree fetch failed:", err);
    } finally {
      setIsTreeLoading(false);
    }
  }, [diskId]);

  useEffect(() => {
    refreshTree();
  }, [refreshTree]);

  const expandPathChain = useCallback((paths: string[]) => {
    setExpandedPaths(new Set(paths));
  }, []);

  const toggleFolderExpand = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const openFile = useCallback(
    (file: FileNode) => {
      if (file.type !== "file") return;
      const normalizedPath = pathSystem.normalize(file.path);

      setTabs((prevTabs) => {
        const existing = prevTabs.find((t) => t.id === file.id);
        if (existing) return prevTabs;

        const newTab: EditorTab = {
          id: file.id,
          nodeId: file.id,
          contentId: file.contentId ?? null,
          name: file.name || pathSystem.baseName(normalizedPath),
          language: file.language || pathSystem.language(normalizedPath),
          content: "",
          path: normalizedPath,
          isDirty: false,
          isSaving: false,
        };

        if (file.contentId) {
          getFileContentRequest(file.contentId)
            .then((res) => {
              if (res.success) {
                setTabs((cur) =>
                  cur.map((t) => (t.id === file.id ? { ...t, content: res.data } : t))
                );
              }
            })
            .catch((err) => console.error("Content fetch failed:", err));
        }

        return [...prevTabs, newTab];
      });
      setActiveTabId(file.id);
      setRevealPath(normalizedPath);
      expandPathChain(getAncestorPaths(pathSystem.parentPath(normalizedPath)));
    },
    [expandPathChain]
  );

  const openFolder = useCallback(
    async (folder: FileNode) => {
      if (folder.type !== "folder") return;
      await refreshTree();
      const normalizedPath = pathSystem.normalize(folder.path);
      setRevealPath(normalizedPath);
      expandPathChain(getAncestorPaths(normalizedPath));
    },
    [expandPathChain, refreshTree]
  );

  const closeTab = useCallback((tabId: string) => {
    if (saveTimers.current[tabId]) {
      clearTimeout(saveTimers.current[tabId]);
      delete saveTimers.current[tabId];
    }
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== tabId);
      setActiveTabId((cur) =>
        cur === tabId ? (next.length ? next[next.length - 1].id : null) : cur
      );
      return next;
    });
  }, []);

  const { refreshPendingCount } = useSync();

  const updateTabContent = useCallback(
    (tabId: string, newContent: string) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === tabId ? { ...t, content: newContent, isDirty: true } : t))
      );

      if (saveTimers.current[tabId]) clearTimeout(saveTimers.current[tabId]);
      saveTimers.current[tabId] = setTimeout(async () => {
        setTabs((prev) => {
          const tab = prev.find((t) => t.id === tabId);
          if (!tab) return prev;

          (async () => {
            if (tab.nodeId.startsWith("local-")) {
              await updateIndexedDBNodeContent(tab.nodeId, tab.content);
            } else if (tab.contentId) {
              await queuePendingOp({
                type: "content-update",
                nodeId: tab.nodeId,
                contentId: tab.contentId,
                data: tab.content,
              });
            }
            await refreshPendingCount();
            setTabs((cur) =>
              cur.map((t) => (t.id === tabId ? { ...t, isDirty: false, isSaving: false } : t))
            );
          })();

          return prev.map((t) => (t.id === tabId ? { ...t, isSaving: true } : t));
        });
      }, 800);
    },
    [refreshPendingCount]
  );

  const createNode = useCallback(
    async (parentId: string, name: string, type: "file" | "folder") => {
      const parentNode = parentId === "root" ? fileTree : findNodeById(fileTree, parentId);
      const parentPath = parentNode ? parentNode.path : "/";
      const newPath = pathSystem.join(parentPath, name);

      const localNode: FileNodeLite = {
        id: `local-${Date.now()}`,
        diskId,
        parentId: parentId === "root" ? null : parentId,
        name,
        type,
        path: newPath,
        language: type === "file" ? pathSystem.language(newPath) : undefined,
        content: type === "file" ? "" : undefined,
        contentId: null,
      };

      await saveToIndexedDB(localNode);
      await refreshPendingCount();
      await refreshTree();
    },
    [diskId, fileTree, refreshPendingCount, refreshTree]
  );

  const deleteNode = useCallback(
    async (nodeId: string) => {
      if (nodeId.startsWith("local-")) {
        await removeIndexedDBNode(nodeId);
      } else {
        await queuePendingOp({ type: "delete", nodeId });
      }
      await refreshPendingCount();
      closeTab(nodeId);
      setFileTree((prev) => removeNodeFromTree(prev, nodeId));
    },
    [closeTab, refreshPendingCount]
  );

  const moveNode = useCallback((_draggedId: string, _targetFolderId: string) => {
    console.warn("moveNode: backend ma move/update-parent endpoint add karya pachi wire karvu.");
  }, []);

  return (
    <EditorContext.Provider
      value={{
        diskId,
        fileTree,
        isTreeLoading,
        tabs,
        activeTabId,
        revealPath,
        expandedPaths,
        toggleFolderExpand,
        openFile,
        openFolder,
        closeTab,
        setActiveTabId,
        createNode,
        deleteNode,
        moveNode,
        updateTabContent,
        refreshTree,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within an EditorProvider");
  return ctx;
};