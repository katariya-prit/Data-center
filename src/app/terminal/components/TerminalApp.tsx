import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getExplorerTreeRequest,
  getFileContentRequest,
  type FileNode,
} from "../../../service/explorer_service"; // તમારા સેવાઓ નો સાચો Relative Path ચકાસી લેવો
import {
  normalizePath,
  joinPath,
  getParentPath,
} from "../../../system/path/index"; // તમારી Path System Utility

interface CommandHistory {
  id: number;
  type: "input" | "output";
  text: string;
  path?: string;
}

export default function TerminalApp() {
  const { user } = useAuth();
  const [tree, setTree] = useState<FileNode[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [history, setHistory] = useState<CommandHistory[]>([
    {
      id: 1,
      type: "output",
      text: `Last login: ${new Date().toLocaleString()} on ttys000\nType 'help' to view available commands.`,
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  // 1. ડિસ્કનું આખું ફાઇલ ટ્રી લોડ કરો
  useEffect(() => {
    if (user?.diskId) {
      setLoading(true);
      getExplorerTreeRequest(user.diskId)
        .then((res) => {
          if (res.success) {
            setTree(res.tree || []);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch tree:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [user?.diskId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // વર્તમાન પાથ નો FileNode શોધો
  const findNodeByPath = (nodes: FileNode[], targetPath: string): FileNode | null => {
    const normTarget = normalizePath(targetPath);
    if (normTarget === "/") return null; // Root Level

    for (const node of nodes) {
      if (normalizePath(node.path) === normTarget) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = findNodeByPath(node.children, normTarget);
        if (found) return found;
      }
    }
    return null;
  };

  // વર્તમાન પાથ ની અંદરના બાળકો (Children) મેળવો
  const getCurrentDirectoryChildren = (): FileNode[] => {
    const normPath = normalizePath(currentPath);
    if (normPath === "/") {
      return tree;
    }
    const currentNode = findNodeByPath(tree, normPath);
    return currentNode && currentNode.type === "folder" ? currentNode.children || [] : [];
  };

  // કમાન્ડ હેન્ડલર
  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const newHistory: CommandHistory[] = [
      ...history,
      { id: Date.now(), type: "input", text: cmd, path: currentPath },
    ];

    const [command, ...args] = cmd.split(" ");
    const argPath = args.join(" ").trim();

    let responseText = "";

    switch (command.toLowerCase()) {
      case "help":
        responseText = "Available commands:\n  ls            List files/folders\n  cd <dir>      Change directory\n  pwd           Print working directory\n  cat <file>    View file contents\n  whoami        Display current user\n  clear         Clear screen\n  date          Display current date & time";
        break;

      case "clear":
        setHistory([]);
        setInput("");
        return;

      case "pwd":
        responseText = currentPath;
        break;

      case "whoami":
        responseText = user?.enrollment || "user";
        break;

      case "date":
        responseText = new Date().toString();
        break;

      case "ls": {
        const children = getCurrentDirectoryChildren();
        if (children.length === 0) {
          responseText = "(empty directory)";
        } else {
          responseText = children
            .map((item) => (item.type === "folder" ? `${item.name}/` : item.name))
            .join("   ");
        }
        break;
      }

      case "cd": {
        if (!argPath || argPath === "~" || argPath === "/") {
          setCurrentPath("/");
          responseText = "";
        } else if (argPath === "..") {
          const parent = getParentPath(currentPath);
          setCurrentPath(parent);
          responseText = "";
        } else {
          const targetPath = joinPath(currentPath, argPath);
          const children = getCurrentDirectoryChildren();
          const targetNode = children.find(
            (c) => c.name.toLowerCase() === argPath.toLowerCase()
          );

          if (!targetNode) {
            responseText = `cd: no such file or directory: ${argPath}`;
          } else if (targetNode.type !== "folder") {
            responseText = `cd: not a directory: ${argPath}`;
          } else {
            setCurrentPath(targetPath);
            responseText = "";
          }
        }
        break;
      }

      case "cat": {
        if (!argPath) {
          responseText = "usage: cat <file_name>";
        } else {
          const children = getCurrentDirectoryChildren();
          const targetNode = children.find(
            (c) => c.name.toLowerCase() === argPath.toLowerCase()
          );

          if (!targetNode) {
            responseText = `cat: ${argPath}: No such file or directory`;
          } else if (targetNode.type === "folder") {
            responseText = `cat: ${argPath}: Is a directory`;
          } else if (!targetNode.contentId) {
            responseText = "(empty file)";
          } else {
            try {
              const res = await getFileContentRequest(targetNode.contentId);
              responseText = res.data || "(empty file)";
            } catch (err: any) {
              responseText = `cat: error reading file: ${err.message || "failed"}`;
            }
          }
        }
        break;
      }

      default:
        responseText = `zsh: command not found: ${command}`;
        break;
    }

    if (responseText) {
      newHistory.push({ id: Date.now() + 1, type: "output", text: responseText });
    }
    setHistory(newHistory);
    setInput("");
  };

  const username = user?.enrollment || "user";

  return (
    <div
      className="h-full w-full bg-[#18181b] p-4 font-mono text-xs text-zinc-100 overflow-y-auto select-text"
      onClick={() => document.getElementById("terminal-active-input")?.focus()}
    >
      {loading && (
        <div className="text-zinc-500 mb-2">Connecting to disk storage...</div>
      )}

      {history.map((item) => (
        <div key={item.id} className="mb-2 whitespace-pre-wrap leading-relaxed">
          {item.type === "input" ? (
            <div className="flex items-center gap-2">
              <span className="text-sky-400 font-bold">
                {username}@macbook:{item.path}$
              </span>
              <span className="text-emerald-400">{item.text}</span>
            </div>
          ) : (
            <div className="text-zinc-300 pl-1">{item.text}</div>
          )}
        </div>
      ))}

      <form onSubmit={handleCommand} className="flex items-center gap-2 mt-1">
        <span className="text-sky-400 font-bold shrink-0">
          {username}@macbook:{currentPath}$
        </span>
        <input
          id="terminal-active-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent text-emerald-400 outline-none border-none font-mono caret-white"
          autoFocus
          autoComplete="off"
        />
      </form>
      <div ref={bottomRef} />
    </div>
  );
}