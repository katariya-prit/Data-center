import Window from "../../system/window/core/Window";
import WindowController from "../../system/window/core/windowController";
import TerminalApp from "./components/TerminalApp";
import { useAuth } from "../../context/AuthContext";

interface TerminalIndexProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export default function TerminalIndex({
  onClose,
  onMinimize,
  onMaximize,
}: TerminalIndexProps) {
  const { user } = useAuth();

  return (
    <Window
      outlet={
        <div className="flex flex-col h-full w-full bg-[#18181b] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-[#1e1e22]">
            <WindowController
              onClose={onClose}
              onMinimize={onMinimize}
              onMaximize={onMaximize}
            />
            <span className="text-xs text-zinc-400 font-mono font-medium pr-2">
              {user?.enrollment || "user"}@macbook: ~ - zsh
            </span>
          </div>

          <div className="flex-1 w-full overflow-hidden">
            <TerminalApp />
          </div>
        </div>
      }
    />
  );
}