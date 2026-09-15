import React, { useState, useEffect, useRef } from "react";
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
import { pathSystem } from "../../../system/path";
import OptionBox, { type ContextMenuItem } from "../../explorer/components/operations/optionBox";

function FileIcon({ node }: { node: FileNode }) {
    if (node.type === "folder") return null;
    if (node.language === "json") return <VscJson size={14} className="shrink-0 text-blue-500" />;
    if (node.language === "typescript") return <VscCode size={14} className="shrink-0 text-indigo-500" />;
    if (node.language === "markdown") return <VscMarkdown size={14} className="shrink-0 text-slate-500" />;
    return <VscFile size={14} className="shrink-0 text-slate-400" />;
}

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    node: FileNode | null;
}

interface CodeEditorSidebarProps {
    controller?: React.ReactNode;
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
    const { openFile, activeTabId, deleteNode, moveNode, expandedPaths, toggleFolderExpand, revealPath } = useEditor();
    const normalizedNodePath = pathSystem.normalize(node.path);

    const isExpanded = expandedPaths.has(normalizedNodePath);
    const isRevealTarget = revealPath != null && normalizedNodePath === revealPath;
    const [isDragOver, setIsDragOver] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);

    const isSelected = node.type === "file" ? activeTabId === node.id : isRevealTarget;

    useEffect(() => {
        if (isRevealTarget && nodeRef.current) {
            nodeRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    }, [isRevealTarget, revealPath]);

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
            <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                <div
                    ref={nodeRef}
                    draggable
                    onDragStart={handleDragStart}
                    onClick={() => toggleFolderExpand(normalizedNodePath)}
                    onContextMenu={(e) => onContextMenu(e, node)}
                    className={`group flex cursor-pointer items-center justify-between rounded-xl py-1 px-2 text-[12px] transition-colors hover:bg-slate-100 hover:text-slate-900 ${
                        isSelected ? "bg-slate-200/80 text-slate-900 font-medium shadow-sm" : "text-slate-600"
                    } ${isDragOver ? "bg-blue-50 border border-dashed border-blue-400 rounded-xl" : ""}`}
                    style={{ paddingLeft: `${level * 12 + 8}px` }}
                >
                    <div className="flex items-center gap-1.5 truncate">
                        {isExpanded ? <VscChevronDown size={13} className="text-slate-500" /> : <VscChevronRight size={13} className="text-slate-500" />}
                        {isExpanded ? (
                            <VscFolderOpened size={15} className="text-amber-500" />
                        ) : (
                            <VscFolder size={15} className="text-amber-500" />
                        )}
                        <span className="truncate">{node.name}</span>
                    </div>
                </div>
                {isExpanded &&
                    node.children?.map((child) => (
                        <TreeNode key={child.id} node={child} level={level + 1} onContextMenu={onContextMenu} />
                    ))}
            </div>
        );
    }

    return (
        <div
            ref={nodeRef}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => openFile(node)}
            onContextMenu={(e) => onContextMenu(e, node)}
            className={`group flex cursor-pointer items-center justify-between rounded-xl py-1 px-2 text-[12px] transition-all ${
                isSelected ? "bg-slate-200/80 text-slate-900 font-medium shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            } ${isDragOver ? "bg-blue-50 border border-dashed border-blue-400 rounded-xl" : ""}`}
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
                className="opacity-0 group-hover:opacity-100 rounded-lg p-1 hover:bg-slate-200 text-slate-400 hover:text-red-500 transition-colors"
            >
                <VscTrash size={13} />
            </button>
        </div>
    );
}

export default function CodeEditorSidebar({ controller }: CodeEditorSidebarProps) {
    // Editor Context માંથી fetchFileTree કે સ્પેસિફિક રિફ્રેશ ફંક્શન મેળવો
    const editorContext = useEditor();
    const { fileTree, createNode, deleteNode } = editorContext;
    
    // જો context માં સ્પેશિયલ રિફ્રેશ ફંકશન ઉપલબ્ધ હોય તો તેનો ઉપયોગ થશે
    const refreshTree = (editorContext as any).refreshTree || (editorContext as any).fetchFileTree;

    const [refreshKey, setRefreshKey] = useState(0);

    const [menuState, setMenuState] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        node: null,
    });

    // રિફ્રેશ હેન્ડલર: માત્ર સાઇડબાર નોડ્સ અને ટ્રી-ડેટા રીલોડ કરશે
    const handleSidebarRefresh = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // ૧. સાઇડબાર કમ્પોનન્ટને લોકલી રી-રેન્ડર કરવા માટે સ્કેલ-અપ કી
        setRefreshKey((prev) => prev + 1);

        // ૨. જો Context માંથી backend કે સ્થાનિક ડેટા ફ્રેશ કરવાનો કૉલ હોવ તો તેને ટ્રિગર કરો
        if (typeof refreshTree === "function") {
            refreshTree();
        }
    };

    const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuState({ visible: true, x: e.clientX, y: e.clientY, node });
    };

    const handleCreateFile = (targetFolderId = "root") => {
        const fileName = prompt("Enter file name (e.g., app.ts):");
        if (fileName) createNode(targetFolderId, fileName, "file");
    };

    const handleCreateFolder = (targetFolderId = "root") => {
        const folderName = prompt("Enter folder name:");
        if (folderName) createNode(targetFolderId, folderName, "folder");
    };

    const getContextMenuOptions = (): ContextMenuItem[] => {
        const node = menuState.node;
        if (!node) return [];

        const options: ContextMenuItem[] = [];

        if (node.type === "folder") {
            options.push(
                {
                    label: "New File...",
                    icon: <VscNewFile size={14} />,
                    action: () => handleCreateFile(node.id),
                },
                {
                    label: "New Folder...",
                    icon: <VscNewFolder size={14} />,
                    action: () => handleCreateFolder(node.id),
                    separator: node.id !== "root",
                }
            );
        }

        if (node.id !== "root") {
            options.push({
                label: "Delete",
                icon: <VscTrash size={14} />,
                danger: true,
                action: () => deleteNode(node.id),
            });
        }

        return options;
    };

    const hasFiles =
        fileTree && ((fileTree.children && fileTree.children.length > 0) || fileTree.type === "file");

    return (
        <div className="my-1 ml-1 w-60 z-10 h-full shrink-0 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col justify-between bg-blue-50 backdrop-blur-md text-slate-700 select-none">
            <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-slate-200/70">
                <div className="flex items-center">{controller}</div>
                <div className="flex items-center gap-1">
                    <button onClick={() => handleCreateFile("root")} title="New File" className="rounded-lg p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                        <VscNewFile size={15} />
                    </button>
                    <button onClick={() => handleCreateFolder("root")} title="New Folder" className="rounded-lg p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                        <VscNewFolder size={15} />
                    </button>
                    <button 
                        onClick={handleSidebarRefresh} 
                        title="Refresh Explorer" 
                        className="rounded-lg p-1.5 hover:bg-slate-200 hover:text-slate-900 transition-colors active:rotate-180 transition-transform duration-300"
                    >
                        <VscRefresh size={15} />
                    </button>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                {hasFiles ? (
                    fileTree.children && fileTree.children.length > 0 ? (
                        fileTree.children.map((child) => (
                            <TreeNode key={`${child.id}-${refreshKey}`} node={child} level={0} onContextMenu={handleContextMenu} />
                        ))
                    ) : (
                        <TreeNode key={`${fileTree.id}-${refreshKey}`} node={fileTree} level={0} onContextMenu={handleContextMenu} />
                    )
                ) : (
                    <div className="flex h-32 items-center justify-center text-xs text-slate-400 italic">
                        No files available
                    </div>
                )}
            </div>

            {menuState.visible && (
                <OptionBox
                    x={menuState.x}
                    y={menuState.y}
                    options={getContextMenuOptions()}
                    onClose={() => setMenuState((prev) => ({ ...prev, visible: false }))}
                />
            )}
        </div>
    );
}