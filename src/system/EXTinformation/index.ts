export interface FileTypeInfo {
  type: "code" | "pdf" | "image" | "text" | "folder" | "unknown";
  label: string;
  defaultExt: string;
}

export const EXTENSION_MAP: Record<string, FileTypeInfo> = {
  ts: { type: "code", label: "TypeScript Source", defaultExt: "ts" },
  tsx: { type: "code", label: "React TypeScript", defaultExt: "tsx" },
  js: { type: "code", label: "JavaScript Source", defaultExt: "js" },
  json: { type: "code", label: "JSON Configuration", defaultExt: "json" },
  pdf: { type: "pdf", label: "PDF Document", defaultExt: "pdf" },
  png: { type: "image", label: "PNG Image", defaultExt: "png" },
  jpg: { type: "image", label: "JPEG Image", defaultExt: "jpg" },
  svg: { type: "image", label: "Vector Image", defaultExt: "svg" },
  txt: { type: "text", label: "Text File", defaultExt: "txt" },
};

export function getFileTypeInfo(fileName: string): FileTypeInfo {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return EXTENSION_MAP[ext] || { type: "unknown", label: "File", defaultExt: "" };
}

export function formatFileSize(bytes: number = 1024): string {
  if (bytes < 1024) return bytes + " B";
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + " KB";
  const mb = kb / 1024;
  return mb.toFixed(1) + " MB";
}