// ============================================================================
// optionBox.tsx
// ----------------------------------------------------------------------------
// Aa file UI POTE nathi banavti. UI/rendering/positioning have OS-WIDE
// service tarike `system/EXTinformation/ContextMenu.tsx` ma chhe — je
// badhi apps (Explorer, Code Editor, Settings, etc.) reuse kare chhe.
//
// Aa file no kaam fakt: EXPLORER APP ma "kaya component par right-click
// thay to kaya options batavva" — e ROUTING/MAPPING logic rakhvani chhe.
// (file → getFileOptions, folder → getFolderOptions, empty-area → getEmptyAreaOptions)
// ============================================================================

import type { FileNode } from "../../../../service/explorer_service";
import { getFileOptions } from "./core/file";
import { getFolderOptions } from "./core/folder";
import { getEmptyAreaOptions } from "./core/empty";

// UI/rendering service — OS-wide, generic, koi hardcoded option nathi
export { ContextMenu as default } from "../../../../system/EXTinformation";
export type { ContextMenuItem } from "../../../../system/EXTinformation";

import type { ContextMenuItem } from "../../../../system/EXTinformation";

export interface BuildContextMenuArgs {
  node?: FileNode; // undefined = empty area par right-click thayu
  onOpenFile: (file: FileNode) => void;
  onOpenFolder: (folder: FileNode) => void;
  onRename: (node: FileNode) => void;
  onDelete: (node: FileNode) => void;
  onNewFileInFolder: (folder: FileNode) => void;
  onNewSubfolder: (folder: FileNode) => void;
  onNewFileAtRoot: () => void;
  onNewFolderAtRoot: () => void;
  onRefresh: () => void;
}

/**
 * buildExplorerContextMenu — EXPLORER-SPECIFIC routing function.
 * Node no type check kari ne sachu option-generator call kare chhe.
 * Aa function fakt EXPLORER app mate chhe — bija apps (code-editor, settings)
 * potana `operations/optionBox.tsx` (ke similar) ma potanu ALAG routing rakhse.
 */
export function buildExplorerContextMenu({
  node,
  onOpenFile,
  onOpenFolder,
  onRename,
  onDelete,
  onNewFileInFolder,
  onNewSubfolder,
  onNewFileAtRoot,
  onNewFolderAtRoot,
  onRefresh,
}: BuildContextMenuArgs): ContextMenuItem[] {
  // ---- Case 1: File par right-click ----
  if (node && node.type === "file") {
    return getFileOptions(onOpenFile, onRename, onDelete).map((opt) => ({
      label: opt.label,
      danger: opt.danger,
      action: () => opt.action(node),
    }));
  }

  // ---- Case 2: Folder par right-click ----
  if (node && node.type === "folder") {
    return getFolderOptions(
      onOpenFolder,
      onNewFileInFolder,
      onNewSubfolder,
      onRename,
      onDelete
    ).map((opt) => ({
      label: opt.label,
      danger: opt.danger,
      action: () => opt.action(node),
    }));
  }

  // ---- Case 3: Khali (empty) area par right-click ----
  return getEmptyAreaOptions(onNewFileAtRoot, onNewFolderAtRoot, onRefresh);
}