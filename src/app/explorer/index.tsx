import { useState } from "react";
import ExplorerApp from "./components/ExplorerApp";
import { SyncProvider } from "../../system/sync/SyncContext";
import type { FileNode } from "../../service/explorer_service";
import Window from "../../system/window/core/Window";
import Sidebar from "./components/Sidebar";
import WindowController from "../../system/window/core/windowController";

interface ExplorerAppProps {
    diskId?: string;
    onOpenInCodeEditor?: (file: FileNode) => void;
    onClose?: () => void;
    onMinimize?: () => void;
    onMaximize?: () => void;
}

export default function ExplorerIndex({
    diskId = "local-disk",
    onOpenInCodeEditor,
    onClose,
    onMinimize,
    onMaximize,
}: ExplorerAppProps) {
    const [activeFolder, setActiveFolder] = useState<string>("Local Storage");

    return (
        <SyncProvider>
            <Window
                outlet={
                    <ExplorerApp
                        diskId={diskId}
                        onOpenInCodeEditor={onOpenInCodeEditor}
                    />
                }
                sidebar={
                    <Sidebar
                        controller={
                            <WindowController onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} />
                        }
                        onFolderSelect={(folderName) => setActiveFolder(folderName)}
                        activeFolder={activeFolder}
                    />
                }
            />
        </SyncProvider>
    );
}

export type { FileNode };