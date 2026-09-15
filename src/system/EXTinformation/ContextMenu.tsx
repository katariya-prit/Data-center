import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  dividerBefore?: boolean;
  separator?: boolean;
  action: () => void;
}

export interface ContextMenuProps {
  x: number;
  y: number;
  options: ContextMenuItem[];
  onClose: () => void;
}

const MIN_WIDTH = 200;

/**
 * ContextMenu — EK GENERIC SERVICE (system/EXTinformation).
 * Fakt `options` data leve chhe, koi hardcoded option nathi.
 * document.body ma PORTAL thi render thay chhe, jethi WindowManager na
 * framer-motion transform (x/y/scale) thi thato "containing block" bug na aave.
 */
export default function ContextMenu({ x, y, options, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y, ready: false });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const padding = 8;

    let nextX = x;
    let nextY = y;

    if (nextX + rect.width > window.innerWidth - padding) {
      nextX = Math.max(padding, window.innerWidth - rect.width - padding);
    }
    if (nextY + rect.height > window.innerHeight - padding) {
      nextY = Math.max(padding, window.innerHeight - rect.height - padding);
    }

    setPos({ x: nextX, y: nextY, ready: true });
  }, [x, y]);

  useEffect(() => {
    const handleClickOutside = () => onClose();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleScroll = () => onClose();

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", onClose);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: pos.y,
        left: pos.x,
        zIndex: 9999,
        opacity: pos.ready ? 1 : 0,
        minWidth: MIN_WIDTH,
      }}
      onClick={(e) => e.stopPropagation()}
      className="rounded-xl border border-black/10 bg-white/70 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl backdrop-saturate-150 text-[13px] text-black/85 select-none"
    >
      {options.map((opt, i) => (
        <div key={i}>
          {opt.dividerBefore && <div className="my-1 border-t border-black/10" />}
          <button
            disabled={opt.disabled}
            onClick={() => {
              if (opt.disabled) return;
              opt.action();
              onClose();
            }}
            className={`flex w-full items-center justify-between gap-3 px-3 py-[5px] transition-colors ${
              opt.disabled
                ? "cursor-not-allowed text-black/30"
                : opt.danger
                ? "text-red-600 hover:bg-red-500/10"
                : "text-black/85 hover:bg-blue-500 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              {opt.icon && <span className="flex h-4 w-4 items-center justify-center shrink-0">{opt.icon}</span>}
              <span className="truncate">{opt.label}</span>
            </span>
            {opt.shortcut && <span className="text-[11px] text-black/40">{opt.shortcut}</span>}
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}