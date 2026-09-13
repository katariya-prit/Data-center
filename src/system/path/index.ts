// ============================================================
// Path System — centralized path utilities for the file explorer
// & code editor. Badhi jagya (Explorer, EditorContext, Sidebar)
// aa j functions vaparva, jethi path construction consistent rahe.
// ============================================================

const SEP = "/";

/** Path ne normalize kare: double slashes hatavi, trailing slash kadhi, always leading "/" rakhe */
export function normalizePath(path: string): string {
  if (!path) return SEP;
  const parts = path.split(SEP).filter(Boolean);
  return SEP + parts.join(SEP);
}

/** Be (ke vadhu) path segments ne sachi rite jodi ne ek valid path banave */
export function joinPath(...segments: (string | null | undefined)[]): string {
  const cleaned = segments
    .filter((s): s is string => Boolean(s && s.trim()))
    .map((s) => s.replace(/^\/+|\/+$/g, "")); // leading/trailing slashes kadho
  return normalizePath(SEP + cleaned.join(SEP));
}

/** Path manthi file/folder nu name kadhi ape (last segment) */
export function getBaseName(path: string): string {
  const parts = normalizePath(path).split(SEP).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}

/** Path manthi parent folder no path kadhi ape */
export function getParentPath(path: string): string {
  const parts = normalizePath(path).split(SEP).filter(Boolean);
  parts.pop();
  return parts.length ? SEP + parts.join(SEP) : SEP;
}

/** File extension kadhi ape (dot vagar, lowercase) */
export function getExtension(path: string): string {
  const name = getBaseName(path);
  const idx = name.lastIndexOf(".");
  if (idx <= 0) return ""; // ".gitignore" jevi files mate "" j rakhvu
  return name.slice(idx + 1).toLowerCase();
}

/** Extension parthi Monaco editor ni language id nakki kare */
export function getLanguageFromPath(path: string): string {
  const ext = getExtension(path);
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    md: "markdown",
    css: "css",
    scss: "scss",
    html: "html",
    py: "python",
    yml: "yaml",
    yaml: "yaml",
    sh: "shell",
    env: "plaintext",
    txt: "plaintext",
  };
  return map[ext] ?? "plaintext";
}

/** Path na dot-separated (breadcrumb) segments aape, dareke segment no cumulative path sathe */
export interface PathSegment {
  name: string;
  path: string;
}

export function getBreadcrumbs(path: string): PathSegment[] {
  const parts = normalizePath(path).split(SEP).filter(Boolean);
  const crumbs: PathSegment[] = [];
  let acc = "";
  for (const part of parts) {
    acc += SEP + part;
    crumbs.push({ name: part, path: acc });
  }
  return crumbs;
}

/** Check kare ke `child` khareki `parent` ni andar (direct ke nested) chhe ke nahi */
export function isDescendantPath(parent: string, child: string): boolean {
  const p = normalizePath(parent);
  const c = normalizePath(child);
  if (p === SEP) return c !== SEP;
  return c === p || c.startsWith(p + SEP);
}

/** Rename/move thay tyare, descendant paths ne update karva mate helper */
export function replacePathPrefix(path: string, oldPrefix: string, newPrefix: string): string {
  const p = normalizePath(path);
  const oldP = normalizePath(oldPrefix);
  if (p === oldP) return normalizePath(newPrefix);
  if (p.startsWith(oldP + SEP)) {
    return normalizePath(newPrefix + p.slice(oldP.length));
  }
  return p;
}

export const pathSystem = {
  join: joinPath,
  normalize: normalizePath,
  baseName: getBaseName,
  parentPath: getParentPath,
  extension: getExtension,
  language: getLanguageFromPath,
  breadcrumbs: getBreadcrumbs,
  isDescendant: isDescendantPath,
  replacePrefix: replacePathPrefix,
};

export default pathSystem;