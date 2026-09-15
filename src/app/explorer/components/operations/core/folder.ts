import type { FileNode } from "../../../../../service/explorer_service";

export interface MenuOption {
    label: string;
    action: (node: FileNode) => void;
    danger?: boolean;
}

export const getFolderOptions = (
    onOpenFolder: (folder: FileNode) => void,
    onCreateFile: (parentFolder: FileNode) => void,
    onCreateFolder: (parentFolder: FileNode) => void,
    onRename: (folder: FileNode) => void,
    onDelete: (folder: FileNode) => void
): MenuOption[] => [
    { label: "Open Folder", action: onOpenFolder },
    { label: "New File Here", action: onCreateFile },
    { label: "New Subfolder", action: onCreateFolder },
    { label: "Rename", action: onRename },
    { label: "Delete Folder", action: onDelete, danger: true },
];