import type { ComponentType } from "react";
import {
  VscHome,
  VscOrganization,
  VscBook,
  VscAccount,
  VscSettingsGear,
  VscCode,
} from "react-icons/vsc";

import CodeEditorSidebar from "../section/Code-Editor/core/Sidebar";

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

  /*
   * Custom sidebar component.
   * If present -> Render sidebar
   * If undefined -> Do NOT render sidebar
   */
  sidebar?: ComponentType;
}

export const navItems: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: VscHome,
    path: "/dashboard",
    // Sidebar નથી આપ્યો -> No Sidebar
  },
  {
    key: "groups",
    label: "Groups",
    icon: VscOrganization,
    path: "/dashboard/groups",
    children: [
      { label: "Create Group", path: "/dashboard/groups/create" },
      { label: "Group List", path: "/dashboard/groups" },
    ],
  },
  {
    key: "lessons",
    label: "Lessons",
    icon: VscBook,
    path: "/dashboard/lessons",
    children: [
      { label: "Create Lesson", path: "/dashboard/lessons/create" },
      { label: "Lesson List", path: "/dashboard/lessons" },
      { label: "Lesson Upload", path: "/dashboard/lessons/upload" },
    ],
  },
  {
    key: "users",
    label: "Users",
    icon: VscAccount,
    path: "/dashboard/users",
  },
  {
    key: "code-editor",
    label: "Code Editor",
    icon: VscCode,
    path: "/dashboard/code-editor",
    // ફક્ત અહીં જ કસ્ટમ સાઇડબાર આપ્યો છે
    sidebar: CodeEditorSidebar,
  },
  {
    key: "settings",
    label: "Settings",
    icon: VscSettingsGear,
    path: "/dashboard/settings",
  },
];