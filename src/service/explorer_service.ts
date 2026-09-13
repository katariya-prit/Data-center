import { api } from "./api";

export interface FileNode {
  id: string;
  diskId: string;
  parentId: string | null;
  contentId: string | null;
  name: string;
  type: "file" | "folder";
  path: string;
  language?: string;
  children?: FileNode[];
  metadata?: {
    size: number;
    version: number;
    [key: string]: any;
  };
}

export interface TreeResponse {
  success: boolean;
  tree: FileNode[];
}

export interface ContentResponse {
  success: boolean;
  data: string;
}

export interface CreateNodePayload {
  diskId: string;
  parentId?: string | null;
  name: string;
  type: "file" | "folder";
  path: string;
  language?: string;
  content?: string;
}

// 1. ડિસ્કનું આખું ફાઇલ ટ્રી લાવો
export function getExplorerTreeRequest(diskId: string) {
  return api.get<TreeResponse>(`/explorer/tree?diskId=${diskId}`, { auth: true });
}

// 2. નવી ફાઇલ કે ફોલ્ડર બનાવો
export function createNodeRequest(payload: CreateNodePayload) {
  return api.post<{ success: boolean; node: FileNode }>("/explorer/node", payload, { auth: true });
}

// 3. ફાઇલ પર ક્લિક થતાં તેનું કન્ટેન્ટ મેળવો
export function getFileContentRequest(contentId: string) {
  return api.get<ContentResponse>(`/explorer/content/${contentId}`, { auth: true });
}

// 4. ફાઇલ સેવ કરો (Content Update)
export function updateFileContentRequest(contentId: string, data: string, nodeId?: string) {
  return api.put<{ success: boolean; message: string }>(
    `/explorer/content/${contentId}`,
    { data, nodeId },
    { auth: true }
  );
}

// 5. ફાઇલ કે ફોલ્ડર ડીલીટ કરો
export function deleteNodeRequest(nodeId: string) {
  return api.delete<{ success: boolean; message: string }>(`/explorer/node/${nodeId}`, { auth: true });
}