import React from "react";

export interface WindowProps {
    sidebar?: React.ReactNode;
    outlet: React.ReactNode;
    className?: string;
}

export default function Window({
    sidebar,
    outlet,
    className = "",
}: WindowProps) {
    return (
        <div className={`flex h-full p-0.5 rounded-3xl shadow-lg w-full bg-white overflow-hidden ${className}`}>
            {sidebar}
            <div className="flex-1 h-full min-w-0 overflow-auto relative">
                {outlet}
            </div>
        </div>
    );
}