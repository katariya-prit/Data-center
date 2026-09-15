import { useState, useCallback } from "react";
import type { ContextMenuItem } from "./ContextMenu";

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}

/**
 * useContextMenu — service hook.
 * App potani andar aa hook vapari ne `openMenu(event, items)` call kare,
 * pachi `<ContextMenu {...menuProps} />` render kare.
 */
export function useContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    items: [],
  });

  const openMenu = useCallback((e: React.MouseEvent, items: ContextMenuItem[]) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ visible: true, x: e.clientX, y: e.clientY, items });
  }, []);

  const closeMenu = useCallback(() => {
    setMenu((prev) => (prev.visible ? { ...prev, visible: false } : prev));
  }, []);

  return { menu, openMenu, closeMenu };
}