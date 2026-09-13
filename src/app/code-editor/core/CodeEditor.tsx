import Editor from "@monaco-editor/react";
import { VscClose, VscJson, VscCode, VscVscode } from "react-icons/vsc";
import { useEditor } from "../../../context/EditorContext";
import CodeEditorSidebar from "./Sidebar";

export default function CodeEditor() {
  const { tabs, activeTabId, setActiveTabId, closeTab, updateTabContent } = useEditor();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex h-full w-full bg-[#151721] overflow-hidden">
      {/* ડાબી બાજુ: Sidebar */}
      <div className="w-64 h-full shrink-0">
        <CodeEditorSidebar />
      </div>

      {/* જમણી બાજુ: Tabs + Monaco Editor */}
      <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#151721] text-[#c8ced8]">
        {/* Dynamic Tabs Header Bar */}
        {tabs.length > 0 && (
          <div className="flex h-10 min-h-10 items-center overflow-x-auto border-b border-[#282c3a] bg-[#181b25]">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`group flex h-full cursor-pointer items-center justify-between border-r border-[#282c3a] px-3 text-xs min-w-[120px] max-w-[180px] ${
                  activeTabId === tab.id
                    ? "bg-[#151721] text-[#e0e5ed] border-t-2 border-t-[#8ab4f8]"
                    : "text-[#747d8d] hover:bg-[#1e222d]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {tab.language === "json" ? <VscJson size={14} /> : <VscCode size={14} />}
                  <span className="truncate">{tab.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="ml-2 rounded p-0.5 hover:bg-[#282c3a]"
                >
                  <VscClose size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Editor Main Content Area */}
        <div className="relative flex-1 h-full w-full">
          {!activeTab || tabs.length === 0 ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[#151721] text-[#6cb6ff]/40 select-none">
              <VscVscode size={100} className="mb-4 text-[#282c3a] animate-pulse" />
              <span className="text-sm font-medium text-[#565f73]">
                Select or create a file to start editing
              </span>
            </div>
          ) : (
            <Editor
              height="100%"
              width="100%"
              language={activeTab.language}
              theme="vs-dark"
              value={activeTab.content}
              onChange={(val) => updateTabContent(activeTab.id, val ?? "")}
              options={{ automaticLayout: true, fontSize: 14 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}