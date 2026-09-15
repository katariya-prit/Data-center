import Editor from "@monaco-editor/react";
import { VscClose, VscJson, VscCode, VscVscode } from "react-icons/vsc";
import { useEditor } from "../../../context/EditorContext";

export default function CodeEditor() {
    const { tabs, activeTabId, setActiveTabId, closeTab, updateTabContent } = useEditor();

    const activeTab = tabs.find((t) => t.id === activeTabId);

    return (
        <div className="flex h-full w-full overflow-hidden bg-white">
            <div className="flex flex-1 flex-col h-full overflow-hidden text-slate-800 bg-white">
                {tabs.length > 0 && (
                    <div className="flex h-10 min-h-10 items-center gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 px-1 rounded-xl">
                        {tabs.map((tab) => (
                            <div
                                key={tab.id}
                                onClick={() => setActiveTabId(tab.id)}
                                className={`group flex h-8 cursor-pointer items-center justify-between rounded-xl px-3 text-xs min-w-30 max-w-45 transition-colors ${activeTabId === tab.id
                                        ? "bg-white text-slate-900 shadow-sm border border-slate-200 rounded-xl font-medium"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-xl"
                                    }`}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    {tab.language === "json" ? (
                                        <VscJson size={14} className="text-blue-500 shrink-0" />
                                    ) : (
                                        <VscCode size={14} className="text-indigo-500 shrink-0" />
                                    )}
                                    <span className="truncate">{tab.name}</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeTab(tab.id);
                                    }}
                                    className="ml-2 rounded-md p-0.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                                >
                                    <VscClose size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="relative flex-1 h-full w-full z-10 bg-transparent overflow-hidden">
                    {!activeTab || tabs.length === 0 ? (
                        <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 select-none">
                            <VscVscode size={100} className="mb-4 text-slate-200 animate-pulse" />
                            <span className="text-sm font-medium text-slate-500">
                                Select or create a file to start editing
                            </span>
                        </div>
                    ) : (
                        <Editor
                            width="100%"
                            height="100%"
                            language={activeTab.language}
                            theme="vs"
                            value={activeTab.content}
                            onChange={(val) => updateTabContent(activeTab.id, val ?? "")}
                            onMount={(editor, monaco) => {
                                // 1. Format Document Action
                                editor.addAction({
                                    id: "custom-format-code",
                                    label: "Format Document",
                                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
                                    contextMenuGroupId: "1_modification",
                                    contextMenuOrder: 1,
                                    run: (ed) => {
                                        ed.getAction("editor.action.formatDocument")?.run();
                                    },
                                });

                                // 2. Duplicate Line Action
                                editor.addAction({
                                    id: "custom-duplicate-line",
                                    label: "Duplicate Line Down",
                                    keybindings: [monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.DownArrow],
                                    contextMenuGroupId: "1_modification",
                                    contextMenuOrder: 2,
                                    run: (ed) => {
                                        ed.getAction("editor.action.copyLinesDownAction")?.run();
                                    },
                                });

                                // 3. Toggle Line Comment Action
                                editor.addAction({
                                    id: "custom-toggle-comment",
                                    label: "Toggle Line Comment",
                                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash],
                                    contextMenuGroupId: "1_modification",
                                    contextMenuOrder: 3,
                                    run: (ed) => {
                                        ed.getAction("editor.action.commentLine")?.run();
                                    },
                                });

                                // 4. Clear All Content Action
                                editor.addAction({
                                    id: "custom-clear-all",
                                    label: "Clear All Content",
                                    contextMenuGroupId: "9_cutcopypaste",
                                    contextMenuOrder: 4,
                                    run: (ed) => {
                                        ed.setValue("");
                                    },
                                });
                            }}
                            options={{
                                // વ્યવસ્થિત લેઆઉટ અને ફોન્ટ્સ
                                automaticLayout: true,
                                fontSize: 14,
                                fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                                fontLigatures: true,
                                tabSize: 2,

                                // રાઇટ ક્લિક Context Menu ઓન
                                contextmenu: true,

                                // વિઝ્યુઅલ અને એનિમેશન ઓપ્શન્સ
                                cursorBlinking: "smooth",
                                cursorSmoothCaretAnimation: "on",
                                smoothScrolling: true,
                                renderLineHighlight: "all",
                                folding: true,

                                // બ્રેક-પેર કલરિંગ અને ઓટો ક્લોઝ
                                bracketPairColorization: { enabled: true },
                                autoClosingBrackets: "always",
                                autoClosingQuotes: "always",
                                autoSurround: "languageDefined",

                                // ઓટો ફોર્મેટ સેટિંગ્સ
                                formatOnPaste: true,
                                formatOnType: true,

                                // મિનીમેપ
                                minimap: { enabled: true },

                                // સ્મૂથ સ્ક્રોલબાર્સ
                                scrollbar: {
                                    vertical: "visible",
                                    horizontal: "visible",
                                    verticalScrollbarSize: 10,
                                    horizontalScrollbarSize: 10,
                                },
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}