import { useState, useEffect, useCallback, useMemo } from "react";
import { pathSystem } from "../../../system/path";
import { formatFileSize } from "../../../system/EXTinformation";

// API Imports
import {
    getExplorerTreeRequest,
    createNodeRequest,
    updateFileContentRequest,
    deleteNodeRequest,
    type FileNode,
} from "../../../service/explorer_service";

// Context Menu Operations Imports
import OptionBox, { buildExplorerContextMenu, type ContextMenuItem } from "./operations/optionBox";

// Icons
import {
    VscChevronRight,
    VscFolder,
    VscFile,
    VscFileCode,
    VscFilePdf,
    VscFileMedia,
    VscSearch,
    VscTrash,
    VscNewFolder,
    VscNewFile,
    VscFiles,
    VscArrowUp,
    VscCopy,
} from "react-icons/vsc";
import {
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineChevronUp,
    HiOutlineFolder,
    HiOutlineViewList,
    HiOutlineViewGrid,
    HiBookmark,
    HiOutlineBookmark,
    HiOutlinePencil,
    HiOutlineHand,
    HiOutlineEye,
    HiOutlineScissors,
    HiOutlineDuplicate,
} from "react-icons/hi";
import { FileGridItem } from "../core/FileGridItem";
import { FileListItem } from "../core/FileListItem";

interface Props {
    diskId?: string;
    externalActiveFolderId?: string | null;
    onSelectFolder?: (folderId: string | null) => void;
    onOpenInCodeEditor?: (file: FileNode) => void;
}

function flattenTree(nodes: FileNode[]): FileNode[] {
    let result: FileNode[] = [];
    for (const node of nodes) {
        result.push(node);
        if (node.children && node.children.length > 0) {
            result = result.concat(flattenTree(node.children));
        }
    }
    return result;
}

export default function ExplorerApp({
    diskId = "local-disk",
    externalActiveFolderId = null,
    onSelectFolder,
    onOpenInCodeEditor,
}: Props) {
    const [activeFolderId, setActiveFolderId] = useState<string | null>(externalActiveFolderId);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const [nodes, setNodes] = useState<FileNode[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [history, setHistory] = useState<(string | null)[]>([externalActiveFolderId]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalType, setModalType] = useState<"folder" | "file" | "rename">("folder");
    const [itemName, setItemName] = useState<string>("");

    // UI Toggle States (માત્ર આઇકન બદલવા માટે)
    const [isGridView, setIsGridView] = useState<boolean>(false);
    const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        options: ContextMenuItem[];
    } | null>(null);

    useEffect(() => {
        if (externalActiveFolderId !== activeFolderId) {
            setActiveFolderId(externalActiveFolderId);
            setSelectedFileId(null);
        }
    }, [externalActiveFolderId]);

    const loadTree = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getExplorerTreeRequest(diskId);
            if (res && res.success) {
                const flatData = Array.isArray(res.tree) ? flattenTree(res.tree) : [];
                setNodes(flatData);
            } else {
                setNodes([]);
            }
        } catch (error) {
            console.error("API Fetch Error:", error);
            setNodes([]);
        } finally {
            setLoading(false);
        }
    }, [diskId]);

    useEffect(() => {
        loadTree();
    }, [loadTree]);

    const navigateToFolder = (folderId: string | null) => {
        if (folderId === activeFolderId) return;
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, folderId]);
        setHistoryIndex(newHistory.length);
        setActiveFolderId(folderId);
        setSelectedFileId(null);
        if (onSelectFolder) onSelectFolder(folderId);
    };

    const handleBack = () => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            setHistoryIndex(prevIndex);
            setActiveFolderId(history[prevIndex]);
            setSelectedFileId(null);
            if (onSelectFolder) onSelectFolder(history[prevIndex]);
        }
    };

    const handleForward = () => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            setHistoryIndex(nextIndex);
            setActiveFolderId(history[nextIndex]);
            setSelectedFileId(null);
            if (onSelectFolder) onSelectFolder(history[nextIndex]);
        }
    };

    const handleNavigateUp = () => {
        if (!activeFolderId) return;
        const currentFolder = nodes.find((n) => n.id === activeFolderId);
        navigateToFolder(currentFolder?.parentId ?? null);
    };

    const openCreateModal = (type: "folder" | "file") => {
        setModalType(type);
        setItemName(type === "folder" ? "New Folder" : "untitled.txt");
        setIsModalOpen(true);
    };

    const handleDeleteNode = async (nodeId: string) => {
        if (confirm("Are you sure you want to delete this item?")) {
            try {
                await deleteNodeRequest(nodeId);
                if (selectedFileId === nodeId) setSelectedFileId(null);
                await loadTree();
            } catch (err) {
                console.error("Delete Error:", err);
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isModalOpen) return;

            if (e.key === "Delete" && selectedFileId) {
                handleDeleteNode(selectedFileId);
            } else if (e.key === "F2" && selectedFileId) {
                const node = nodes.find((n) => n.id === selectedFileId);
                if (node) {
                    setModalType("rename");
                    setItemName(node.name);
                    setIsModalOpen(true);
                }
            } else if (e.key === "Escape") {
                setSelectedFileId(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedFileId, isModalOpen, nodes]);

    const handleConfirmModalAction = async () => {
        if (!itemName.trim()) return;

        try {
            if (modalType === "rename") {
                if (!selectedFileId) return;
                const targetNode = nodes.find((n) => n.id === selectedFileId);
                if (targetNode && targetNode.contentId) {
                    await updateFileContentRequest(targetNode.contentId, "", targetNode.id);
                    await loadTree();
                }
            } else {
                const parentPath = activeFolderId
                    ? nodes.find((n) => n.id === activeFolderId)?.path ?? "/"
                    : "/";

                await createNodeRequest({
                    diskId,
                    parentId: activeFolderId,
                    name: itemName,
                    type: modalType,
                    path: pathSystem.join ? pathSystem.join(parentPath, itemName) : `${parentPath}/${itemName}`,
                    content: "",
                });

                await loadTree();
            }
        } catch (err) {
            console.error("Action Error:", err);
        }

        setIsModalOpen(false);
    };

    const handleContextMenu = (e: React.MouseEvent, node?: FileNode) => {
        e.preventDefault();
        e.stopPropagation();

        if (node) setSelectedFileId(node.id);

        const menuItems = buildExplorerContextMenu({
            node,
            onOpenFile: (f) => onOpenInCodeEditor?.(f),
            onOpenFolder: (f) => navigateToFolder(f.id),
            onRename: (f) => {
                setSelectedFileId(f.id);
                setModalType("rename");
                setItemName(f.name);
                setIsModalOpen(true);
            },
            onDelete: (f) => handleDeleteNode(f.id),
            onNewFileInFolder: (f) => {
                setActiveFolderId(f.id);
                openCreateModal("file");
            },
            onNewSubfolder: (f) => {
                setActiveFolderId(f.id);
                openCreateModal("folder");
            },
            onNewFileAtRoot: () => openCreateModal("file"),
            onNewFolderAtRoot: () => openCreateModal("folder"),
            onRefresh: () => loadTree(),
        });

        setContextMenu({ x: e.clientX, y: e.clientY, options: menuItems });
    };

    const renderFileIcon = (fileName: string, type: string, viewMode: "list" | "grid" = "list") => {
        const isGrid = viewMode === "grid";

        // Dynamic Classes: List માં નાના icon (text-base) અને Grid માં મોટા icon (text-4xl અથવા text-5xl)
        const iconSize = isGrid ? "text-7xl mb-1 shrink-0" : "text-base shrink-0";

        if (type === "folder") {
            return <VscFolder className={`text-sky-500 ${iconSize}`} />;
        }

        const ext = fileName.split(".").pop()?.toLowerCase();

        if (["mp3", "aif", "wav", "flac", "mp4", "mkv"].includes(ext || "")) {
            return <VscFileMedia className={`text-cyan-600 ${iconSize}`} />;
        }
        if (ext === "pdf") {
            return <VscFilePdf className={`text-red-500 ${iconSize}`} />;
        }
        if (["ts", "js", "tsx", "jsx", "json", "html", "css"].includes(ext || "")) {
            return <VscFileCode className={`text-blue-500 ${iconSize}`} />;
        }

        return <VscFile className={`text-slate-400 ${iconSize}`} />;
    };

    const getFileKind = (fileName: string, type: string) => {
        if (type === "folder") return "Folder";
        const ext = fileName.split(".").pop()?.toUpperCase() || "";
        return ext ? `${ext} Document` : "Document";
    };

    const currentBreadcrumb = useMemo(() => {
        const pathNodes: FileNode[] = [];
        let currId = activeFolderId;

        while (currId) {
            const found = nodes.find((n) => n.id === currId);
            if (found) {
                pathNodes.unshift(found);
                currId = found.parentId;
            } else {
                break;
            }
        }
        return pathNodes;
    }, [activeFolderId, nodes]);

    const currentItems = nodes.filter((n) =>
        searchQuery
            ? n.name.toLowerCase().includes(searchQuery.toLowerCase())
            : n.parentId === activeFolderId
    );

    const currentFolderNode = nodes.find((n) => n.id === activeFolderId);
    const selectedItemNode = nodes.find((n) => n.id === selectedFileId);

    return (
        <div
            className="flex h-full w-full text-slate-800 select-none overflow-hidden font-sans antialiased relative"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => handleContextMenu(e)}
        >
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center text-slate-500 gap-1">
                            <div className="p-1 flex gap-3.5 rounded-2xl shadow-lg">
                                <button
                                    onClick={handleBack}
                                    disabled={historyIndex === 0}
                                    className="p-1.5 rounded-2xl cursor-pointer hover:text-blue-600 duration-300 text-slate-600 disabled:opacity-40"
                                >
                                    <HiOutlineChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={handleForward}
                                    disabled={historyIndex >= history.length - 1}
                                    className="p-1.5 rounded-2xl cursor-pointer hover:text-blue-600 duration-300 text-slate-600 disabled:opacity-40"
                                >
                                    <HiOutlineChevronRight size={16} />
                                </button>
                                <button
                                    onClick={handleNavigateUp}
                                    disabled={!activeFolderId}
                                    className="p-1.5 rounded-2xl cursor-pointer hover:text-blue-600 duration-300 text-slate-600 disabled:opacity-40"
                                >
                                    <HiOutlineChevronUp size={16} />
                                </button>
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                            {currentFolderNode ? currentFolderNode.name : "Home"}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600">
                        <button onClick={() => openCreateModal("folder")} title="New Folder" className="hover:text-black rounded-2xl shadow-lg p-2">
                            <HiOutlineFolder size={18} />
                        </button>

                        <div className="flex gap-3 p-2 shadow-lg rounded-2xl">
                            <button onClick={() => setIsGridView(!isGridView)} title="Toggle View" className="hover:text-black">
                                {isGridView ? <HiOutlineViewGrid size={18} /> : <HiOutlineViewList size={18} />}
                            </button>
                            <button onClick={() => setIsBookmarked(!isBookmarked)} title="Bookmark" className="hover:text-black">
                                {isBookmarked ? <HiBookmark size={18} className="text-blue-500" /> : <HiOutlineBookmark size={18} />}
                            </button>
                        </div>

                        <div className="relative flex gap-2 items-center ml-2 shadow-lg rounded-2xl p-2">
                            <VscSearch className="text-slate-400" size={13} />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-32"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 py-2 bg-slate-50/50 border-b border-slate-200/50 text-slate-600 text-xs">
                    <div className="flex items-center gap-3.5">
                        <div className="p-1 flex gap-3.5 rounded-2xl shadow-md bg-white border border-slate-200/60">
                            <button onClick={() => openCreateModal("folder")} title="New Folder" className="hover:text-blue-600 p-1">
                                <VscNewFolder size={15} />
                            </button>
                            <button onClick={() => openCreateModal("file")} title="New File" className="hover:text-blue-600 p-1">
                                <VscNewFile size={15} />
                            </button>
                        </div>

                        <div className="p-1 flex gap-3.5 rounded-2xl shadow-md bg-white border border-slate-200/60">
                            <button
                                onClick={() => selectedFileId && handleDeleteNode(selectedFileId)}
                                disabled={!selectedFileId}
                                title="Delete"
                                className="hover:text-red-600 p-1 disabled:opacity-40"
                            >
                                <VscTrash size={15} />
                            </button>
                        </div>

                        <div className="p-1 flex gap-3.5 rounded-2xl shadow-md bg-white border border-slate-200/60">
                            <button
                                onClick={() => {
                                    if (selectedFileId) {
                                        setModalType("rename");
                                        const node = nodes.find((n) => n.id === selectedFileId);
                                        if (node) setItemName(node.name);
                                        setIsModalOpen(true);
                                    }
                                }}
                                disabled={!selectedFileId}
                                title="Rename"
                                className="hover:text-blue-600 p-1 disabled:opacity-40"
                            >
                                <HiOutlinePencil size={15} />
                            </button>
                            <button title="Duplicate" className="hover:text-blue-600 p-1">
                                <VscFiles size={15} />
                            </button>
                            <button title="Select Mode" className="hover:text-blue-600 p-1">
                                <HiOutlineHand size={15} />
                            </button>
                            <button title="Preview" className="hover:text-blue-600 p-1">
                                <HiOutlineEye size={15} />
                            </button>
                        </div>

                        <div className="p-1 flex gap-3.5 rounded-2xl shadow-md bg-white border border-slate-200/60">
                            <button title="Cut" className="hover:text-blue-600 p-1">
                                <HiOutlineScissors size={15} />
                            </button>
                            <button title="Copy" className="hover:text-blue-600 p-1">
                                <HiOutlineDuplicate size={15} />
                            </button>
                        </div>
                    </div>

                    <div className="p-1 flex gap-3.5 rounded-2xl shadow-md bg-white border border-slate-200/60">
                        <button title="Multiple Files / Copy" className="hover:text-blue-600 p-1">
                            <VscCopy size={15} />
                        </button>
                        <button title="Open with Arrow" className="hover:text-blue-600 p-1">
                            <VscArrowUp size={15} className="rotate-45" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto px-2 custom-scroll" onClick={() => setSelectedFileId(null)}>
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-slate-400 text-xs">Loading items...</div>
                    ) : currentItems.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                            {searchQuery ? "No matching files found" : "Folder is empty"}
                        </div>
                    ) : isGridView ? (
                        /* GRID / CARD VIEW */
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 p-2">
                            {currentItems.map((item) => (
                                <FileGridItem
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedFileId === item.id}
                                    renderIcon={renderFileIcon}
                                    onSelect={(e) => {
                                        e.stopPropagation();
                                        setSelectedFileId(item.id);
                                    }}
                                    onContextMenu={(e) => handleContextMenu(e, item)}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        item.type === "folder" ? navigateToFolder(item.id) : onOpenInCodeEditor?.(item);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        /* LIST VIEW */
                        <div className="w-full text-left flex flex-col">
                            <div className="flex items-center text-[11px] font-semibold text-slate-500 sticky top-0 z-10 py-1 px-4 bg-white/80 backdrop-blur-sm">
                                <div className="flex-1">Name</div>
                                <div className="w-44">Date Modified</div>
                                <div className="w-24">Size</div>
                                <div className="w-44">Kind</div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                {currentItems.map((item) => (
                                    <FileListItem
                                        key={item.id}
                                        item={item}
                                        isSelected={selectedFileId === item.id}
                                        renderIcon={renderFileIcon}
                                        getFileKind={getFileKind}
                                        formatFileSize={formatFileSize}
                                        onSelect={(e) => {
                                            e.stopPropagation();
                                            setSelectedFileId(item.id);
                                        }}
                                        onContextMenu={(e) => handleContextMenu(e, item)}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            item.type === "folder" ? navigateToFolder(item.id) : onOpenInCodeEditor?.(item);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between px-4 py-1 text-[11px] text-slate-500 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="cursor-pointer hover:underline" onClick={() => navigateToFolder(null)}>
                            Home
                        </span>
                        {currentBreadcrumb.map((crumb) => (
                            <div key={crumb.id} className="flex items-center gap-1.5">
                                <VscChevronRight size={10} />
                                <span
                                    className="cursor-pointer hover:underline truncate max-w-[100px]"
                                    onClick={() => navigateToFolder(crumb.id)}
                                >
                                    {crumb.name}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex-shrink-0 ml-2">
                        {currentItems.length} items,{" "}
                        {selectedItemNode ? `1 selected` : "0 selected"}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-50 flex items-center justify-center">
                    <div className="p-4 rounded-xl w-72 shadow-2xl flex flex-col gap-3 bg-white">
                        <h3 className="text-xs font-semibold text-slate-800 uppercase">
                            {modalType === "rename" ? "Rename Item" : `New ${modalType}`}
                        </h3>
                        <input
                            type="text"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleConfirmModalAction();
                                if (e.key === "Escape") setIsModalOpen(false);
                            }}
                            className="border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 outline-none focus:border-blue-500"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-3 py-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmModalAction}
                                className="px-3 py-1 rounded text-xs font-medium bg-[#007aff] text-white shadow-sm hover:bg-blue-600"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {contextMenu && (
                <OptionBox
                    x={contextMenu.x}
                    y={contextMenu.y}
                    options={contextMenu.options}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
}