'use client';

import React, { Children, cloneElement, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, type MotionValue, type SpringOptions } from 'framer-motion';
import './Dock.css';

export interface DockItemData {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  onCloseApp?: () => void;
  className?: string;
  isActive?: boolean;
  isRunning?: boolean;
}

interface DockProps {
  items: DockItemData[];
  className?: string;
  spring?: SpringOptions;
  magnification?: number;
  distance?: number;
  panelHeight?: number;
  dockHeight?: number;
  baseItemSize?: number;
}

interface DockItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onCloseApp?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  magnification: number;
  baseItemSize: number;
  label: string;
  isActive?: boolean;
  isRunning?: boolean;
}

interface DockLabelProps {
  children: React.ReactNode;
  className?: string;
  isHovered?: MotionValue<number>;
  isRunning?: boolean;
  onCloseApp?: () => void;
}

function DockItem({
  children,
  className = '',
  onClick,
  onCloseApp,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  isActive = false,
  isRunning = false,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onClick={onClick}
      className={`dock-item relative flex items-center justify-center ${className}`}
    >
      {Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return cloneElement(child as React.ReactElement<{ isHovered?: MotionValue<number>; isRunning?: boolean; onCloseApp?: () => void }>, {
            isHovered,
            isRunning,
            onCloseApp,
          });
        }
        return child;
      })}

      {isActive && (
        <span className="absolute -bottom-2.5 h-1 w-1 rounded-full bg-white/90 shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
      )}
    </motion.div>
  );
}

function DockLabel({ children, className = '', isHovered, isRunning, onCloseApp }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', (latest: number) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.9 }}
          animate={{ opacity: 1, y: -16, scale: 1 }}
          exit={{ opacity: 0, y: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className={`absolute bottom-full left-1/2 -translate-x-1/2 z-50 pointer-events-auto ${className}`}
        >
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-zinc-900/90 text-white border border-white/15 shadow-2xl backdrop-blur-md whitespace-nowrap min-w-[120px] justify-between">
            <span className="text-xs font-mono font-medium text-zinc-200">{children}</span>

            {isRunning && onCloseApp && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseApp();
                }}
                title="Close Application"
                className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500/80 hover:bg-red-600 text-white text-[10px] font-bold transition-all hover:scale-110 active:scale-95"
              >
                ✕
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`dock-icon flex items-center justify-center w-full h-full ${className}`}>{children}</div>;
}

export default function Dock({
  items = [],
  className = '',
  spring = { mass: 0.1, stiffness: 170, damping: 12 },
  magnification = 68,
  distance = 140,
  panelHeight = 58,
  baseItemSize = 44,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div style={{ scrollbarWidth: 'none' }} className="dock-outer flex items-end justify-center">
      <motion.div
        onMouseMove={({ pageX }: React.MouseEvent) => {
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          mouseX.set(Infinity);
        }}
        className={`dock-panel ${className}`}
        style={{ height: panelHeight }}
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            onCloseApp={item.onCloseApp}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            label={item.label}
            isActive={item.isActive}
            isRunning={item.isRunning}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}