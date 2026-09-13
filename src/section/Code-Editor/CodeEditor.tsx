import Editor from "@monaco-editor/react";
import { VscClose, VscJson, VscCode, VscSave, VscTerminal, VscPlay, VscSettingsGear } from "react-icons/vsc";
import { useEditor } from "../../context/EditorContext";
import Dock from "./core/Dock";

export default function CodeEditor() {
  const { tabs, activeTabId, setActiveTabId, closeTab, updateTabContent } = useEditor();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Dock items configuration
  const dockItems = [
    {
      icon: <VscSave size={20} />,
      label: "Save File",
      onClick: () => alert(`Saved: ${activeTab?.name || "No file"}`),
    },
    {
      icon: <VscPlay size={20} />,
      label: "Run Code",
      onClick: () => alert("Executing code..."),
    },
    {
      icon: <VscTerminal size={20} />,
      label: "Toggle Terminal",
      onClick: () => alert("Terminal toggled!"),
    },
    {
      icon: <VscSettingsGear size={20} />,
      label: "Settings",
      onClick: () => alert("Opening settings..."),
    },
  ];

  if (tabs.length === 0 || !activeTab) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-[#151721] text-[#6cb6ff]">
        <span>Select a file from sidebar to start editing</span>
        
        {/* Empty state માં પણ Bottom Center માં Dock આપવા માટે */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <Dock items={dockItems} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-[#151721] text-[#c8ced8]">
      {/* Dynamic Tabs Header Bar */}
      <div className="flex h-10 min-h-[40px] items-center overflow-x-auto border-b border-[#282c3a] bg-[#181b25]">
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

      {/* Monaco Code Editor */}
      <div className="relative flex-1">
        <Editor
          height="100%"
          width="100%"
          language={activeTab.language}
          theme="vs-dark"
          value={activeTab.content}
          onChange={(val) => updateTabContent(activeTab.id, val ?? "")}
          options={{ automaticLayout: true, fontSize: 14 }}
        />

        {/* Dynamic Dock Component at Bottom Center */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-auto z-30">
          <Dock
            items={dockItems}
            panelHeight={54}
            baseItemSize={40}
            magnification={58}
          />
        </div>
      </div>
    </div>
  );
}