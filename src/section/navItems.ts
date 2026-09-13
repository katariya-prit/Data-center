import type { ComponentType } from "react";
import {
  VscAccount,
  VscSettingsGear,
  VscVscode,
} from "react-icons/vsc";
import { IoFolderOpenSharp } from "react-icons/io5";

export interface NavChild {
  label: string;
  path: string;
}

export interface NavItem {
  key: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  path: string;
  children?: NavChild[];
  sidebar?: ComponentType;
}

export const navItems: NavItem[] = [
  {
    key: "users",
    label: "Users",
    icon: VscAccount,
    path: "/dashboard",
  },
  {
    key: "code-editor",
    label: "Code Editor",
    icon: VscVscode,
    path: "/dashboard",
  },
  {
    key: "settings",
    label: "Settings",
    icon: VscSettingsGear,
    path: "/dashboard",
  },
  {
    key: "fileexplorer",
    label: "File Explorer",
    icon: IoFolderOpenSharp,
    path: "/dashboard"
  }
];