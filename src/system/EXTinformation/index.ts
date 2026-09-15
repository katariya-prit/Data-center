// ---- Existing utilities (tamara project ma je pehla thi hata, e AHIYA rehva joie) ----
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function getFileTypeInfo(fileName: string): { type: string } {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["ts", "tsx", "js", "jsx", "json", "html", "css"].includes(ext)) return { type: "code" };
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) return { type: "image" };
  if (ext === "pdf") return { type: "pdf" };
  return { type: "file" };
}

// ---- Navu: ContextMenu SERVICE ----
export { default as ContextMenu } from "./ContextMenu";
export type { ContextMenuItem, ContextMenuProps } from "./ContextMenu";