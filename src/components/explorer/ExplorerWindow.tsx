import { useState, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { VscClose, VscChromeMinimize, VscScreenFull } from "react-icons/vsc";
import { useExplorer } from "../../context/ExplorerContext";

export default function ExplorerWindow() {
  const { isOpen, isMinimized, closeExplorer, toggleMinimize } = useExplorer();
  const [isMaximized, setIsMaximized] = useState(false);
  const dragControls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);

  // Full Screen Toggle Function
  const toggleMaximize = () => {
    setIsMaximized((prev) => !prev);
  };

  return (
    <AnimatePresence>
      {isOpen && !isMinimized && (
        <motion.div
          ref={windowRef}
          drag={!isMaximized} // Full Screen હોય ત્યારે drag ન થાય
          dragControls={dragControls}
          dragListener={false} // માત્ર Header પરથી જ Drag થશે
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.85, y: 100 }}
          animate={
            isMaximized
              ? { opacity: 1, scale: 1, x: 0, y: 0, width: "100vw", height: "100vh", top: 0, left: 0 }
              : { opacity: 1, scale: 1 }
          }
          exit={{ opacity: 0, scale: 0.85, y: 100 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={
            isMaximized
              ? { position: "fixed", inset: 0, zIndex: 50, borderRadius: 0 }
              : {
                  position: "fixed",
                  top: "10%",
                  left: "15%",
                  width: "70vw",
                  height: "70vh",
                  minWidth: "320px",
                  minHeight: "250px",
                  zIndex: 40,
                  resize: "both", // Cursor થી નાનું-મોટું કરવા માટે
                }
          }
          className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#161822]/90 backdrop-blur-xl shadow-2xl"
        >
          {/* iOS Style Header Bar (Hold/Drag કરવા માટે) */}
          <div
            onPointerDown={(e) => !isMaximized && dragControls.start(e)}
            className="flex h-10 items-center justify-between border-b border-white/10 bg-white/5 px-4 select-none cursor-move"
          >
            {/* Control Buttons */}
            <div className="flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
              <button
                onClick={closeExplorer}
                title="Close"
                className="group flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff5f56] text-black transition-opacity hover:opacity-80"
              >
                <VscClose size={9} className="opacity-0 group-hover:opacity-100" />
              </button>
              <button
                onClick={toggleMinimize}
                title="Minimize"
                className="group flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ffbd2e] text-black transition-opacity hover:opacity-80"
              >
                <VscChromeMinimize size={9} className="opacity-0 group-hover:opacity-100" />
              </button>
              <button
                onClick={toggleMaximize}
                title={isMaximized ? "Restore" : "Maximize"}
                className="group flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#27c93f] text-black transition-opacity hover:opacity-80"
              >
                <VscScreenFull size={8} className="opacity-0 group-hover:opacity-100" />
              </button>
            </div>

            {/* Window Title */}
            <span className="text-xs font-medium text-white/70 tracking-wide pointer-events-none">
              File Explorer
            </span>

            <div className="w-12" />
          </div>

          {/* Blank Explorer Workspace Content */}
          <div className="flex-1 overflow-auto p-6 text-white/40 flex items-center justify-center border-dashed border-2 border-white/5 m-3 rounded-xl">
            <p className="text-sm font-light select-none">
              Blank Explorer Window (Drag Header to Move | Resize from Edges)
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}