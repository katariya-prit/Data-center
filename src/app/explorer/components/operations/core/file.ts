import type { FileNode } from "../../../../../service/explorer_service";

export interface MenuOption {
    label: string;
    action: (node: FileNode) => void;
    danger?: boolean;
}

export const getFileOptions = (
    onOpen: (file: FileNode) => void,
    onRename: (file: FileNode) => void,
    onDelete: (file: FileNode) => void
): MenuOption[] => [
    { label: "Open in Code Editor", action: onOpen },
    { label: "Rename", action: onRename },
    { label: "Delete File", action: onDelete, danger: true },
];