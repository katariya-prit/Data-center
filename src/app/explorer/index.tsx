import { useState, useEffect, useCallback } from "react";
import Folder from "./core/Folder";
import Sidebar from "./components/Sidebar";
import { ContextMenu, type ContextMenuTarget } from "./components/ContextMenu";
import { getFileTypeInfo, formatFileSize } from "../../system/EXTinformation";
import { DragDropProvider } from "../../system/drag-drop/DragDropContext";
import { Draggable } from "../../system/drag-drop/Draggable";
import { pathSystem } from "../../system/path"
import { Droppable } from "../../system/drag-drop/Droppable";
import {
    saveToIndexedDB,
    getIndexedDBNodes,
    clearIndexedDB,
} from "../../system/db";
import {
    getExplorerTreeRequest,
    createNodeRequest,
    deleteNodeRequest,
    type FileNode,
} from "../../service/explorer_service";

import {
    VscFileCode,
    VscFilePdf,
    VscFileMedia,
    VscHome,
    VscNewFolder,
    VscFile,
    VscLoading,
    VscSync,
} from "react-icons/vsc";
import { IoFolderOpenSharp } from "react-icons/io5";

interface Props {
    diskId: string;
    onOpenInCodeEditor?: (file: FileNode) => void; // <-- navu prop
}

function flattenTree(tree: FileNode[]): FileNode[] {
    const result: FileNode[] = [];
    const walk = (list: FileNode[]) => {
        for (const node of list) {
            result.push(node);
            if (node.children && node.children.length) {
                walk(node.children);
            }
        }
    };
    walk(tree);
    return result;
}

export default function ExplorerApp({ diskId, onOpenInCodeEditor }: Props) {
    const [selectedLocation, setSelectedLocation] = useState<string>("Local Storage");
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
    const [menuTarget, setMenuTarget] = useState<ContextMenuTarget>({ id: null, type: "blank" });

    const [nodes, setNodes] = useState<FileNode[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [syncing, setSyncing] = useState<boolean>(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalType, setModalType] = useState<"folder" | "file">("folder");
    const [itemName, setItemName] = useState<string>("");

    const loadTree = useCallback(async () => {
        setLoading(true);
        try {
            let remoteNodes: FileNode[] = [];
            if (diskId) {
                const res = await getExplorerTreeRequest(diskId);
                remoteNodes = flattenTree(res.tree || []);
            }
            const localNodes = await getIndexedDBNodes();
            setNodes([...remoteNodes, ...localNodes]);
        } catch (error) {
            console.error("Fetch error:", error);
            const localNodes = await getIndexedDBNodes();
            setNodes(localNodes);
        } finally {
            setLoading(false);
        }
    }, [diskId]);

    useEffect(() => {
        loadTree();
    }, [loadTree]);

    const openCreateModal = (type: "folder" | "file") => {
        setModalType(type);
        setItemName(type === "folder" ? "New Folder" : "untitled.ts");
        setIsModalOpen(true);
        setMenuPosition(null);
    };

    const handleConfirmCreate = async () => {
        if (!itemName.trim()) return;

        const parentPath = activeFolderId
            ? nodes.find((n) => n.id === activeFolderId)?.path ?? "/"
            : "/";

        const newNode: FileNode = {
            id: `local-${Date.now()}`,
            diskId: diskId,
            parentId: activeFolderId,
            name: itemName,
            type: modalType,
            path: pathSystem.join(parentPath, itemName), // <-- centralized path build
            metadata: {
                size: 1024,
                version: 0,
            },
            contentId: null,
        };

        await saveToIndexedDB(newNode);
        setNodes((prev) => [...prev, newNode]);
        setIsModalOpen(false);
    };

    const handleSyncToNeon = async () => {
        if (!diskId) {
            alert("No disk found for this user.");
            return;
        }

        const localNodes = await getIndexedDBNodes();
        if (localNodes.length === 0) {
            alert("No local data to sync!");
            return;
        }

        setSyncing(true);
        try {
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
                    content: node.type === "file" ? "" : undefined,
                });

                idMap[node.id] = res.node.id;
            }

            await clearIndexedDB();
            alert("All local files synced to Neon DB successfully!");
            await loadTree();
        } catch (error) {
            alert("Sync failed! Check your connection.");
        } finally {
            setSyncing(false);
        }
    };

    const handleDeleteTarget = async () => {
        if (!menuTarget.id) return;
        if (confirm("Delete this item?")) {
            try {
                if (menuTarget.id.startsWith("local-")) {
                    setNodes((prev) => prev.filter((n) => n.id !== menuTarget.id));
                } else {
                    await deleteNodeRequest(menuTarget.id);
                    await loadTree();
                }
            } catch (error) {
                alert("Failed to delete");
            }
        }
        setMenuPosition(null);
    };

    // navu: file ne code editor ma DIRECT khol, resolved path sathe
    const handleOpenInCodeEditor = (file: FileNode) => {
        if (file.type !== "file") return;
        const resolvedFile: FileNode = {
            ...file,
            path: pathSystem.normalize(file.path), // exact/normalized path guaranteed
            language: file.language || pathSystem.language(file.path),
        };
        onOpenInCodeEditor?.(resolvedFile);
    };

    const handleOpenInCodeEditorFromMenu = () => {
        if (!menuTarget.id) return;
        const file = nodes.find((n) => n.id === menuTarget.id);
        if (file) handleOpenInCodeEditor(file); // direct open — menu close thata j
        setMenuPosition(null);
    };

    const renderFileIcon = (fileName: string) => {
        const info = getFileTypeInfo(fileName);
        switch (info.type) {
            case "code":
                return <VscFileCode className="text-blue-500 text-[24px]" />;
            case "image":
                return <VscFileMedia className="text-emerald-500 text-[24px]" />;
            case "pdf":
                return <VscFilePdf className="text-red-500 text-[24px]" />;
            default:
                return <VscFile className="text-white/60 text-[24px]" />;
        }
    };

    const currentFolders = nodes.filter(
        (n) => n.type === "folder" && n.parentId === activeFolderId
    );
    const currentFiles = nodes.filter(
        (n) => n.type === "file" && n.parentId === activeFolderId
    );
    const currentFolder = nodes.find((n) => n.id === activeFolderId);
    const isEmpty = currentFolders.length === 0 && currentFiles.length === 0;

    return (
        <DragDropProvider>
            <div
                className="flex h-full w-full bg-[#11131e] text-white/90 select-none overflow-hidden relative"
                onContextMenu={(e) => {
                    e.preventDefault();
                    setMenuPosition({ x: e.clientX, y: e.clientY });
                    setMenuTarget({ id: null, type: "blank" });
                }}
            >
                <Sidebar
                    onFolderSelect={(folderName) => {
                        setSelectedLocation(folderName);
                        setActiveFolderId(null);
                    }}
                    activeFolder={selectedLocation}
                />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 bg-white/5 text-xs">
                        <div className="flex items-center gap-2">
                            <VscHome className="text-white/60" size={14} />
                            <span className="text-white/40">/</span>
                            <span>{selectedLocation}</span>
                            {currentFolder && (() => {
                                const crumbs = pathSystem.breadcrumbs(currentFolder.path);
                                return crumbs.map((crumb, i) => (
                                    <span key={crumb.path} className="flex items-center gap-2">
                                        <span className="text-white/40">/</span>
                                        <span
                                            onClick={() => {
                                                const node = nodes.find((n) => n.path === crumb.path && n.type === "folder");
                                                setActiveFolderId(node ? node.id : null);
                                            }}
                                            className={`cursor-pointer hover:text-white ${i === crumbs.length - 1 ? "text-blue-400 font-semibold" : "text-white/50"
                                                }`}
                                        >
                                            {crumb.name}
                                        </span>
                                    </span>
                                ));
                            })()}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSyncToNeon}
                                disabled={syncing}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 transition text-xs font-medium"
                            >
                                <VscSync size={14} className={syncing ? "animate-spin" : ""} />
                                <span>{syncing ? "Syncing..." : "Sync to Neon DB"}</span>
                            </button>

                            <button
                                onClick={() => openCreateModal("file")}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition text-xs font-medium"
                            >
                                <VscFile size={14} />
                                <span>New File</span>
                            </button>
                            <button
                                onClick={() => openCreateModal("folder")}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition text-xs font-medium"
                            >
                                <VscNewFolder size={14} />
                                <span>New Folder</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-8 overflow-auto custom-scroll bg-[#161822]/60 relative">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-white/40 gap-2">
                                <VscLoading className="animate-spin text-xl" />
                                <span>Fetching items...</span>
                            </div>
                        ) : isEmpty ? (
                            <div className="flex flex-col items-center justify-center h-full text-white/20 gap-3">
                                <IoFolderOpenSharp size={72} className="text-white/10" />
                                <span className="text-sm font-medium">No items in this directory</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 items-start">
                                {currentFolders.map((f) => {
                                    const folderFiles = nodes.filter((n) => n.parentId === f.id);
                                    const previewItems = folderFiles.map((file) => renderFileIcon(file.name));

                                    return (
                                        <Droppable key={f.id} onDropItem={() => { }} acceptTypes={["FILE", "FOLDER"]}>
                                            <Draggable id={f.id} type="FOLDER" data={f}>
                                                <div
                                                    className="flex flex-col items-center gap-2 group cursor-pointer relative"
                                                    onClick={() => setActiveFolderId(f.id)}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setMenuPosition({ x: e.clientX, y: e.clientY });
                                                        setMenuTarget({ id: f.id, type: "folder", name: f.name });
                                                    }}
                                                >
                                                    <Folder color="#5227FF" size={0.9} items={previewItems} />
                                                    <span className="text-xs text-white/80 group-hover:text-white truncate max-w-full flex items-center gap-1">
                                                        {f.name}
                                                        {f.id.startsWith("local-") && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Local Un-synced" />
                                                        )}
                                                    </span>
                                                </div>
                                            </Draggable>
                                        </Droppable>
                                    );
                                })}

                                {currentFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        onDoubleClick={() => handleOpenInCodeEditor(file)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setMenuPosition({ x: e.clientX, y: e.clientY });
                                            setMenuTarget({ id: file.id, type: "file", name: file.name });
                                        }}
                                        className="flex flex-col items-center p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 cursor-pointer relative"
                                    >
                                        {renderFileIcon(file.name)}
                                        <span className="text-xs text-white/80 truncate w-full text-center mt-2 flex items-center justify-center gap-1">
                                            {file.name}
                                            {file.id.startsWith("local-") && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Local Un-synced" />
                                            )}
                                        </span>
                                        <span className="text-[10px] text-white/30 mt-1">
                                            {formatFileSize(file.metadata?.size || 1024)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-[#1a1c29] border border-white/10 p-5 rounded-2xl w-80 shadow-2xl flex flex-col gap-4">
                            <h3 className="text-sm font-semibold text-white">
                                Create New {modalType === "folder" ? "Folder" : "File"}
                            </h3>
                            <input
                                type="text"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && handleConfirmCreate()}
                                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                                placeholder="Enter name..."
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmCreate}
                                    className="px-4 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {menuPosition && (
                    <ContextMenu
                        x={menuPosition.x}
                        y={menuPosition.y}
                        target={menuTarget}
                        onClose={() => setMenuPosition(null)}
                        onOpen={() => menuTarget.id && setActiveFolderId(menuTarget.id)}
                        onOpenInCodeEditor={handleOpenInCodeEditorFromMenu}
                        onNewFile={() => openCreateModal("file")}
                        onNewFolder={() => openCreateModal("folder")}
                        onRename={() => { }}
                        onDelete={handleDeleteTarget}
                        onProperties={() => alert(`Item Name: ${menuTarget.name}`)}
                    />
                )}
            </div>
        </DragDropProvider>
    );
}