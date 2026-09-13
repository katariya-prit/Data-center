import { useState, useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ActivityBar from "../ActivityBar";
import Sidebar from "../Sidebar";
import Header from "../Header";
import { navItems } from "../navItems";

export default function Layout() {
  const location = useLocation();

  // URL ના આધારે સાચું Item શોધો
  const activeTopItem = useMemo(() => {
    const currentPath = location.pathname.toLowerCase();

    return (
      navItems.find((item) => {
        const itemPath = item.path.toLowerCase();
        
        // Exact Path Match
        if (currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)) {
          return true;
        }

        // Submenu (children) ની અંદર Match
        if (item.children) {
          return item.children.some((child) =>
            currentPath.startsWith(child.path.toLowerCase())
          );
        }

        return false;
      }) ?? navItems[0]
    );
  }, [location.pathname]);

  const [openKey, setOpenKey] = useState(activeTopItem.key);
  useEffect(() => {
    if (activeTopItem) {
      setOpenKey(activeTopItem.key);
    }
  }, [activeTopItem]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-(--color-bg) text-(--color-text)">
      {/* 1. Left Icon Activity Bar */}
      <ActivityBar openKey={openKey} onSelect={setOpenKey} />

      <Sidebar openKey={openKey} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />

        <main className="flex-1 overflow-hidden p-3 relative flex flex-col">
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
    </div>
  );
}