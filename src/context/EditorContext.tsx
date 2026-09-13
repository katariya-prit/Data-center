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
  updateFileContentRequest,
  createNodeRequest,
  deleteNodeRequest,
  type FileNode as ApiFileNode,
} from "../service/explorer_service";
import { pathSystem } from "../system/path"; // <-- navu import, sachu relative path check karjo

export interface FileNode extends ApiFileNode {
  content?: string; // lazy-loaded, khali tabs ma vaparay chhe
}

export interface EditorTab {
  id: string; // = node.id
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
  fileTree: FileNode; // wrapped virtual root, .children = actual tree
  isTreeLoading: boolean;
  tabs: EditorTab[];
  activeTabId: string | null;
  openFile: (file: FileNode) => void;
  closeTab: (tabId: string) => void;
  setActiveTabId: (id: string) => void;
  createNode: (parentId: string, name: string, type: "file" | "folder") => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  moveNode: (draggedId: string, targetFolderId: string) => void;
  updateTabContent: (tabId: string, newContent: string) => void;
  refreshTree: () => Promise<void>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

// tree ma id parthi node no path shodhi ape (create karta parentPath mate joie)
function findNodeById(node: FileNode, id: string): FileNode | null {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findNodeById(child as FileNode, id);
    if (found) return found;
  }
  return null;
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
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // -------- Tree fetch --------
  const refreshTree = useCallback(async () => {
    if (!diskId) return;
    setIsTreeLoading(true);
    try {
      const res = await getExplorerTreeRequest(diskId);
      if (res.success) {
        setFileTree((prev) => ({ ...prev, children: res.tree }));
      }
    } catch (err) {
      console.error("Tree fetch failed:", err);
    } finally {
      setIsTreeLoading(false);
    }
  }, [diskId]);

  useEffect(() => {
    refreshTree();
  }, [refreshTree]);

  // -------- Open file (lazy content fetch, exact path sathe) --------
  const openFile = useCallback((file: FileNode) => {
    if (file.type !== "file") return;

    setTabs((prevTabs) => {
      const existing = prevTabs.find((t) => t.id === file.id);
      if (existing) return prevTabs;

      const normalizedPath = pathSystem.normalize(file.path);

      const newTab: EditorTab = {
        id: file.id,
        nodeId: file.id,
        contentId: file.contentId ?? null,
        name: file.name || pathSystem.baseName(normalizedPath),
        language: file.language || pathSystem.language(normalizedPath), // <-- pathSystem thi language
        content: "",
        path: normalizedPath, // <-- exact/normalized path guaranteed
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
  }, []);

  // -------- Close tab --------
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

  // -------- Save (debounced) --------
  const saveTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      const tab = prev.find((t) => t.id === tabId);
      if (!tab || !tab.contentId) return prev;

      updateFileContentRequest(tab.contentId, tab.content, tab.nodeId)
        .then(() => {
          setTabs((cur) =>
            cur.map((t) => (t.id === tabId ? { ...t, isDirty: false, isSaving: false } : t))
          );
        })
        .catch((err) => {
          console.error("Save failed:", err);
          setTabs((cur) => cur.map((t) => (t.id === tabId ? { ...t, isSaving: false } : t)));
        });

      return prev.map((t) => (t.id === tabId ? { ...t, isSaving: true } : t));
    });
  }, []);

  const updateTabContent = useCallback(
    (tabId: string, newContent: string) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === tabId ? { ...t, content: newContent, isDirty: true } : t))
      );
      if (saveTimers.current[tabId]) clearTimeout(saveTimers.current[tabId]);
      saveTimers.current[tabId] = setTimeout(() => saveTab(tabId), 800);
    },
    [saveTab]
  );

  // -------- Create (pathSystem thi path build) --------
  const createNode = useCallback(
    async (parentId: string, name: string, type: "file" | "folder") => {
      const parentNode = parentId === "root" ? fileTree : findNodeById(fileTree, parentId);
      const parentPath = parentNode ? parentNode.path : "/";
      const newPath = pathSystem.join(parentPath, name);

      try {
        await createNodeRequest({
          diskId,
          parentId: parentId === "root" ? null : parentId,
          name,
          type,
          path: newPath, // <-- centralized path build
          language: type === "file" ? pathSystem.language(newPath) : undefined,
          content: type === "file" ? "" : undefined,
        });
        await refreshTree();
      } catch (err) {
        console.error("Create failed:", err);
      }
    },
    [diskId, fileTree, refreshTree]
  );

  // -------- Delete --------
  const deleteNode = useCallback(
    async (nodeId: string) => {
      try {
        await deleteNodeRequest(nodeId);
        closeTab(nodeId);
        await refreshTree();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    },
    [closeTab, refreshTree]
  );

  // -------- Move (backend endpoint nathi, have TODO) --------
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
        openFile,
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