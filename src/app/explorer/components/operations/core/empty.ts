export interface EmptyOption {
    label: string;
    action: () => void;
}

export const getEmptyAreaOptions = (
    onCreateFile: () => void,
    onCreateFolder: () => void,
    onRefresh: () => void
): EmptyOption[] => [
    { label: "New File", action: onCreateFile },
    { label: "New Folder", action: onCreateFolder },
    { label: "Refresh", action: onRefresh },
];