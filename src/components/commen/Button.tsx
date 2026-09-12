import type { ReactNode } from "react";
import { motion } from "motion/react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary";
}

export default function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
}: ButtonProps) {
  const base =
    "w-full cursor-pointer rounded-2xl bg-[#e0e5ec] px-5 py-4 text-[15px] font-semibold " +
    "disabled:cursor-not-allowed disabled:opacity-60";

  const primary =
    "text-[#5b6eae] shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff] " +
    "hover:text-[#46578c] " +
    "active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff]";

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.97, y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`${base} ${variant === "primary" ? primary : ""}`}
    >
      {children}
    </motion.button>
  );
}