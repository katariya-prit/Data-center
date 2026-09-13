export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  language?: string;
  content?: string;
  children?: FileNode[];
}

export const fileTree: FileNode = {
  id: "root",
  name: "data-center",
  type: "folder",
  path: "/data-center",

  children: [
    {
      id: "src",
      name: "src",
      type: "folder",
      path: "/data-center/src",

      children: [
        {
          id: "components",
          name: "components",
          type: "folder",
          path: "/data-center/src/components",

          children: [
            {
              id: "ui",
              name: "ui",
              type: "folder",
              path: "/data-center/src/components/ui",

              children: [
                {
                  id: "button",
                  name: "Button.tsx",
                  type: "file",
                  path: "/data-center/src/components/ui/Button.tsx",
                  language: "typescript",
                  content: `import React from "react";

interface ButtonProps {
  label: string;
}

export default function Button({
  label,
}: ButtonProps) {
  return (
    <button>
      {label}
    </button>
  );
}
`,
                },

                {
                  id: "modal",
                  name: "Modal.tsx",
                  type: "file",
                  path: "/data-center/src/components/ui/Modal.tsx",
                  language: "typescript",
                  content: `interface ModalProps {
  open: boolean;
}

export default function Modal({
  open,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div>
      Modal
    </div>
  );
}
`,
                },
              ],
            },

            {
              id: "header",
              name: "Header.tsx",
              type: "file",
              path: "/data-center/src/components/Header.tsx",
              language: "typescript",
              content: `export default function Header() {
  return (
    <header>
      Data Center
    </header>
  );
}
`,
            },
          ],
        },

        {
          id: "config",
          name: "config",
          type: "folder",
          path: "/data-center/src/config",

          children: [
            {
              id: "config-json",
              name: "config.json",
              type: "file",
              path: "/data-center/src/config/config.json",
              language: "json",
              content: `{
  "appName": "Data Center",
  "version": "1.0.0",
  "environment": "development"
}
`,
            },
          ],
        },

        {
          id: "data",
          name: "data",
          type: "folder",
          path: "/data-center/src/data",

          children: [
            {
              id: "data-json",
              name: "data.json",
              type: "file",
              path: "/data-center/src/data/data.json",
              language: "json",
              content: `{
  "users": [],
  "groups": [],
  "lessons": []
}
`,
            },
          ],
        },

        {
          id: "main",
          name: "main.ts",
          type: "file",
          path: "/data-center/src/main.ts",
          language: "typescript",
          content: `import { startServer } from "./server";

startServer();
`,
        },

        {
          id: "app",
          name: "App.tsx",
          type: "file",
          path: "/data-center/src/App.tsx",
          language: "typescript",
          content: `export default function App() {
  return (
    <div>
      Data Center
    </div>
  );
}
`,
        },
      ],
    },

    {
      id: "public",
      name: "public",
      type: "folder",
      path: "/data-center/public",

      children: [
        {
          id: "favicon",
          name: "favicon.svg",
          type: "file",
          path: "/data-center/public/favicon.svg",
          language: "xml",
          content: `<svg>
  <circle cx="50" cy="50" r="40" />
</svg>
`,
        },

        {
          id: "robots",
          name: "robots.txt",
          type: "file",
          path: "/data-center/public/robots.txt",
          language: "plaintext",
          content: `User-agent: *
Allow: /
`,
        },
      ],
    },

    {
      id: "package",
      name: "package.json",
      type: "file",
      path: "/data-center/package.json",
      language: "json",
      content: `{
  "name": "data-center",
  "version": "1.0.0",
  "private": true
}
`,
    },

    {
      id: "tsconfig",
      name: "tsconfig.json",
      type: "file",
      path: "/data-center/tsconfig.json",
      language: "json",
      content: `{
  "compilerOptions": {
    "strict": true,
    "module": "ESNext"
  }
}
`,
    },

    {
      id: "vite",
      name: "vite.config.ts",
      type: "file",
      path: "/data-center/vite.config.ts",
      language: "typescript",
      content: `import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
  },
});
`,
    },

    {
      id: "readme",
      name: "README.md",
      type: "file",
      path: "/data-center/README.md",
      language: "markdown",
      content: `# Data Center

Data Center management project.

## Development

Run the development server.
`,
    },
  ],
};