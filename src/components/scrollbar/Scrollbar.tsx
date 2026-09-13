import React from "react";
import "./scrollbar.css";

interface CustomScrollbarProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollArea: React.FC<CustomScrollbarProps> = ({ children, className = "" }) => {
  return (
    <div className={`overflow-auto h-full w-full custom-scroll ${className}`}>
      {children}
    </div>
  );
};

export default ScrollArea;