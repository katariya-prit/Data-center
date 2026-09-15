import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  getIndexedDBNodes,
  clearIndexedDB,
  removeIndexedDBNode,
  getPendingOps,
  removePendingOp,
  getPendingCount,
  type FileNodeLite,
} from "../db";
import {
  createNodeRequest,
  deleteNodeRequest,
  updateFileContentRequest,
} from "../../service/explorer_service";

interface SyncContextType {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: number | null;
  refreshPendingCount: () => Promise<void>;
  syncNow: (diskId: string) => Promise<{ success: boolean; message: string }>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch (err) {
      console.error("Pending count fetch failed:", err);
    }
  }, []);

  useEffect(() => {
    refreshPendingCount();
    // dareke 5 sec e badge count refresh thay (background changes pan reflect thay)
    const interval = setInterval(refreshPendingCount, 5000);
    return () => clearInterval(interval);
  }, [refreshPendingCount]);

  const syncNow = useCallback(
    async (diskId: string): Promise<{ success: boolean; message: string }> => {
      if (!diskId) {
        return { success: false, message: "No disk found for this user." };
      }

      setIsSyncing(true);
      try {
        // ---- Step 1: Local (un-synced) navi banaveli nodes push karo ----
        const localNodes = await getIndexedDBNodes();
        const idMap: Record<string, string> = {};
        const remaining = [...localNodes];

        while (remaining.length > 0) {
          const index = remaining.findIndex(
            (n) => !n.parentId || !n.parentId.startsWith("local-") || idMap[n.parentId]
          );
          if (index === -1) break;

          const node = remaining.splice(index, 1)[0];
          const remoteParentId =
            node.parentId && node.parentId.startsWith("local-")
              ? idMap[node.parentId]
              : node.parentId;

          const res = await createNodeRequest({
            diskId,
            parentId: remoteParentId ?? null,
            name: node.name,
            type: node.type,
            path: node.path,
            language: node.language,
            content: node.type === "file" ? node.content ?? "" : undefined,
          });

          idMap[node.id] = res.node.id;
        }
        await clearIndexedDB();

        // ---- Step 2: Pending content-updates / deletes (already-synced nodes) ----
        const pendingOps = await getPendingOps();
        for (const op of pendingOps) {
          try {
            if (op.type === "content-update" && op.contentId) {
              await updateFileContentRequest(op.contentId, op.data ?? "", op.nodeId);
            } else if (op.type === "delete") {
              await deleteNodeRequest(op.nodeId);
            }
            await removePendingOp(op.opId);
          } catch (err) {
            console.error(`Pending op failed (${op.type} - ${op.nodeId}):`, err);
            // continue baki ops sathe, e op queue ma j rahi jashe next sync mate
          }
        }

        setLastSyncedAt(Date.now());
        await refreshPendingCount();
        return { success: true, message: "All changes synced successfully!" };
      } catch (err) {
        console.error("Sync failed:", err);
        return { success: false, message: "Sync failed! Check your connection." };
      } finally {
        setIsSyncing(false);
      }
    },
    [refreshPendingCount]
  );

  return (
    <SyncContext.Provider
      value={{ isSyncing, pendingCount, lastSyncedAt, refreshPendingCount, syncNow }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be used within a SyncProvider");
  return ctx;
};