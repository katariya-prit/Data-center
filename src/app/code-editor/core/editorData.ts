export const getLanguageFromFile = (
  fileName: string,
): string => {
  const extension =
    fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "ts":
      return "TypeScript";

    case "tsx":
      return "TypeScript React";

    case "js":
      return "JavaScript";

    case "jsx":
      return "JavaScript React";

    case "json":
      return "JSON";

    case "css":
      return "CSS";

    case "html":
      return "HTML";

    case "md":
      return "Markdown";

    case "svg":
      return "SVG";

    default:
      return "Plain Text";
  }
};