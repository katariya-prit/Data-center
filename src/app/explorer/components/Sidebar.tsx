import { useState } from "react";
import {
  VscFolder,
  VscChevronRight,
  VscChevronDown,
  VscTrash,
  VscLayoutSidebarLeft,
  VscListFlat,
  VscTag,
  VscStarFull,
  VscDesktopDownload,
  VscFileZip,
  VscCloudDownload,
  VscDeviceCameraVideo,
  VscUnmute,
} from "react-icons/vsc";
import { Droppable } from "../../../system/drag-drop/Droppable";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarGroup {
  id: string;
  title: string;
  items: SidebarItem[];
  defaultExpanded?: boolean;
}

interface SidebarProps {
  onFolderSelect: (folderName: string) => void;
  activeFolder: string;
  controller?: React.ReactNode;
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: "favourites",
    title: "Favourites",
    defaultExpanded: true,
    items: [
      { id: "Local Storage", label: "Local Storage", icon: <VscStarFull size={15} className="text-amber-500" /> },
      { id: "Notes", label: "Notes", icon: <VscFolder size={15} className="text-sky-500" /> },
      { id: "Pics", label: "Pics", icon: <VscFolder size={15} className="text-sky-500" /> },
    ],
  },
  {
    id: "home",
    title: "Home",
    defaultExpanded: true,
    items: [
      { id: "Desktop", label: "Desktop", icon: <VscDesktopDownload size={15} className="text-sky-500" /> },
      { id: "Documents", label: "Documents", icon: <VscFolder size={15} className="text-sky-500" /> },
      { id: "Downloads", label: "Downloads", icon: <VscCloudDownload size={15} className="text-sky-500" /> },
      { id: "Movies", label: "Movies", icon: <VscDeviceCameraVideo size={15} className="text-sky-500" /> },
      { id: "Music", label: "Music", icon: <VscUnmute size={15} className="text-sky-500" /> },
      { id: "Pictures", label: "Pictures", icon: <VscFolder size={15} className="text-sky-500" /> },
    ],
  },
  {
    id: "cloud",
    title: "My Desk",
    defaultExpanded: true,
    items: [
      { id: "My Desk", label: "My Desk", icon: <VscFileZip size={15} className="text-indigo-500" /> },
    ],
  },
];

function GroupSection({
  group,
  activeFolder,
  onSelect,
}: {
  group: SidebarGroup;
  activeFolder: string;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(group.defaultExpanded ?? true);

  return (
    <div>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-700"
      >
        {expanded ? <VscChevronDown size={11} /> : <VscChevronRight size={11} />}
        <span>{group.title}</span>
      </button>

      {expanded && (
        <div className="mt-0.5 space-y-0.5">
          {group.items.map((item) => {
            const isActive = activeFolder === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full flex items-center gap-2.5 pl-6 pr-2.5 py-[5px] rounded-md text-[13px] font-medium transition-colors ${isActive
                    ? "bg-[#0096fd] text-white"
                    : "text-slate-700 hover:bg-slate-200/60"
                  }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ onFolderSelect, activeFolder, controller }: SidebarProps) {
  return (
    <div className="m-1 w-60 h-full shrink-0 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col justify-between bg-blue-50 backdrop-blur-md text-slate-700 select-none">
      <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-slate-200/70">
        <div className="flex items-center">{controller}</div>

        <div className="flex items-center gap-1">
          <button
            title="Toggle Sidebar"
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 transition-colors"
          >
            <VscLayoutSidebarLeft size={15} />
          </button>
          <button
            title="View Options"
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 transition-colors"
          >
            <VscListFlat size={15} />
          </button>
          <button
            title="Tags"
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 transition-colors"
          >
            <VscTag size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll px-1.5 py-2 space-y-3">
        {SIDEBAR_GROUPS.map((group) => (
          <GroupSection
            key={group.id}
            group={group}
            activeFolder={activeFolder}
            onSelect={onFolderSelect}
          />
        ))}

        <div className="pt-1 border-t border-slate-200/70">
          <button
            onClick={() => onFolderSelect("Trash")}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.25 mt-2 rounded-md text-[13px] font-medium transition-colors ${activeFolder === "Trash"
                ? "bg-[#0096fd] text-white"
                : "text-slate-700 hover:bg-slate-200/60"
              }`}
          >
            <VscTrash size={15} className="shrink-0 text-slate-500" />
            <span className="truncate">Trash</span>
          </button>
        </div>
      </div>
    </div>
  );
}