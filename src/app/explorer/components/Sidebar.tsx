import { useState } from "react";
import { VscFolder, VscCloud, VscChevronRight, VscChevronDown } from "react-icons/vsc";
import { Droppable } from "../../../system/drag-drop/Droppable";

interface SidebarProps {
  onFolderSelect: (folderName: string) => void;
  activeFolder: string;
}

export default function Sidebar({ onFolderSelect, activeFolder }: SidebarProps) {
  const [isDeskExpanded, setIsDeskExpanded] = useState<boolean>(true);

  return (
    <div className="w-56 border-r border-white/10 bg-[#0e1017]/80 backdrop-blur-md p-3 flex flex-col justify-between text-xs select-none h-full">
      <div className="flex flex-col gap-4">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-white/40 uppercase px-2 mb-2 block">
            System Locations
          </span>
          <Droppable
            onDropItem={(item) => console.log("Dropped into Local Drive:", item)}
            acceptTypes={["FILE", "FOLDER"]}
          >
            <button
              onClick={() => onFolderSelect("Local Storage")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-medium transition-all ${
                activeFolder === "Local Storage"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <VscFolder size={16} className="text-amber-400" />
              <span>Local Storage</span>
            </button>
          </Droppable>
        </div>

        <div>
          <span className="text-[10px] font-semibold tracking-wider text-white/40 uppercase px-2 mb-2 block flex items-center gap-1.5">
            <VscCloud size={13} className="text-emerald-400" />
            Cloud Storage
          </span>

          <button
            onClick={() => {
              setIsDeskExpanded(!isDeskExpanded);
              onFolderSelect("My Desk");
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
              activeFolder === "My Desk"
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <VscFolder className="text-blue-400" size={15} />
              <span className="font-medium">My Desk</span>
            </div>
            {isDeskExpanded ? <VscChevronDown size={14} /> : <VscChevronRight size={14} />}
          </button>
        </div>
      </div>

      <div className="border-t border-white/10 pt-3 px-2 flex items-center justify-between text-[11px] text-white/40">
        <span>Desk Storage</span>
        <span className="text-emerald-400">Ready</span>
      </div>
    </div>
  );
}