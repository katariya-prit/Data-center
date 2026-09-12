import type { ReactNode, ChangeEvent } from "react";

interface InputProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name: string;
  icon?: ReactNode;
  rightAction?: ReactNode;
}

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  icon,
  rightAction,
}: InputProps) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      {label && (
        <label htmlFor={name} className="pl-1 text-[13px] font-medium text-slate-500">
          {label}
        </label>
      )}

      <div
        className="flex items-center gap-2.5 rounded-2xl bg-[#e0e5ec] px-4
          shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff]
          transition-shadow duration-200
          focus-within:shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_rgba(91,110,174,0.25)]"
      >
        {icon && <span className="flex shrink-0 items-center text-slate-400">{icon}</span>}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 border-none bg-transparent py-3.5 text-[15px] text-slate-700
            outline-none placeholder:text-slate-400"
        />

        {rightAction && (
          <span className="flex shrink-0 cursor-pointer items-center text-slate-400">
            {rightAction}
          </span>
        )}
      </div>
    </div>
  );
}