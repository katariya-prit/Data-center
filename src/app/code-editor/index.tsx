import { useEffect } from "react";
import CodeEditor from "./core/CodeEditor";
import { EditorProvider, useEditor, type FileNode } from "../../context/EditorContext";
import { SyncProvider } from "../../system/sync/SyncContext";
import Window from "../../system/window/core/Window";
import CodeEditorSidebar from "./core/Sidebar";
import { WindowController } from "../../system/window/core";

interface CodeEditorAppProps {
    diskId?: string;
    initialFile?: FileNode;
    onClose?: () => void;
    onMinimize?: () => void;
    onMaximize?: () => void;
}

function CodeEditorInner({ initialFile, onClose, onMinimize, onMaximize }: CodeEditorAppProps) {
    const editor = useEditor();

    useEffect(() => {
        if (!initialFile) return;
        if (initialFile.type === "file") {
            editor.openFile(initialFile);
        } else if (initialFile.type === "folder") {
            editor.openFolder(initialFile);
        }
    }, [initialFile?.id, initialFile?.path]);

    return (
        <Window
            outlet={<CodeEditor />}
            sidebar={
                <CodeEditorSidebar
                    controller={<WindowController onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} />}
                />
            }
        />
    );
}

export default function CodeEditorApp({ diskId, initialFile, onClose, onMinimize, onMaximize }: CodeEditorAppProps) {
    return (
        <SyncProvider>
            <EditorProvider diskId={diskId ?? ""}>
                <CodeEditorInner
                    initialFile={initialFile}
                    onClose={onClose}
                    onMinimize={onMinimize}
                    onMaximize={onMaximize}
                />
            </EditorProvider>
        </SyncProvider>
    );
}