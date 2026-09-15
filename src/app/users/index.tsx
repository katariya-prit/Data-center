import { useAuth } from "../../context/AuthContext";
import UserApp from "./components/UserApp";
import Sidebar from "./components/Sidebar";
import Window from "../../system/window/core/Window";
import { WindowController } from "../../system/window/core";

interface UsersWindowProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export default function UsersWindow({ onClose, onMinimize, onMaximize }: UsersWindowProps) {
  const { user: currentUser } = useAuth();

  return (
    <Window
      sidebar={
        <Sidebar
          currentUser={currentUser}
          controller={<WindowController onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} />}
        />
      }
      outlet={
        currentUser ? (
          <UserApp currentUser={currentUser} />
        ) : (
          <div className="p-6 text-white/60 text-sm h-full bg-[#11131e]">Unable to load profile.</div>
        )
      }
    />
  );
}