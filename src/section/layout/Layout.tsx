import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Sidebar from "../Sidebar";
import Header from "../Header";
import { ExplorerProvider, ExplorerWindow } from "../../components/explorer";
import { GlobalDock } from "../../components/dock";

export default function Layout() {
  const location = useLocation();

  return (
    <ExplorerProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-bg,#0d0e15)] text-[var(--color-text,#fff)] relative">
        
        {/* સાઈડબાર જો કન્સિડર કરેલું હશે તો જ જગ્યા રોકશે */}
        <Sidebar />

        {/* Main Workspace Area */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0 h-full">
          <Header />

          <main className="flex-1 overflow-hidden p-0 relative flex flex-col pb-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-full w-full flex flex-col flex-1 min-h-0"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Floating Windows */}
        <ExplorerWindow />
        <GlobalDock />
      </div>
    </ExplorerProvider>
  );
}