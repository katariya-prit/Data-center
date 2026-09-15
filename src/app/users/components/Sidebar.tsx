import React from "react";
import { VscAccount, VscShield } from "react-icons/vsc";

interface SidebarProps {
  currentUser: { enrollment: string; role: "admin" | "user" } | null;
  controller?: React.ReactNode;
}

export default function Sidebar({ currentUser, controller }: SidebarProps) {
  return (
    <div className="m-1 w-60 h-full shrink-0 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 bg-[#f5f5f7]/90 backdrop-blur-md p-4 flex flex-col justify-between">
      {controller && <div className="flex items-center pb-3 mb-1 border-b border-slate-200/70">{controller}</div>}

      <div className="flex flex-col gap-4 flex-1">
        <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-1">
          User Management
        </span>

        {currentUser && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
            {currentUser.role === "admin" ? (
              <VscShield className="text-amber-500 shrink-0" size={15} />
            ) : (
              <VscAccount className="text-[#0096fd] shrink-0" size={15} />
            )}
            <div className="min-w-0">
              <div className="text-slate-800 font-medium truncate">{currentUser.enrollment}</div>
              <div className="text-slate-400 capitalize">{currentUser.role}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}