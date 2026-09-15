import React, { useState, useEffect } from "react";

export const TopMenuBar: React.FC = () => {
    const [dateTime, setDateTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            });
            const timeStr = now.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });
            setDateTime(`${dateStr} ${timeStr}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="w-full h-7 bg-white/20 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-3 text-xs text-white select-none z-50">

            <div className="flex items-center gap-4 font-medium">
                <button className="hover:opacity-70 transition-opacity">
                    <svg className="w-3.5 h-3.5 fill-current mb-0.5" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.08-3.37-2.62-7.3-7.23-11.79-13.84-5.78-8.56-10.32-17.94-13.62-28.14-3.3-10.21-4.96-20.08-4.96-29.61 0-14.85 3.82-27.17 11.46-36.97 7.64-9.8 17.56-14.79 29.76-14.97 4.58 0 9.71 1.25 15.39 3.75 5.68 2.5 9.77 3.75 12.27 3.75 2.12 0 6.33-1.32 12.63-3.96 6.3-2.64 11.53-3.83 15.69-3.57 11.97.64 21.67 4.96 29.1 12.96-10.59 6.42-15.77 15.38-15.54 26.88.23 9.07 3.65 16.71 10.26 22.92 6.61 6.21 14.39 9.8 23.34 10.77-2.46 7.42-5.75 15.02-9.88 22.8zM119.22 31.09c0-7.07 2.58-13.78 7.74-20.13 5.16-6.35 11.76-10.23 19.8-11.64.24 1.13.36 2.1.36 2.9 0 7.21-2.73 14.15-8.19 20.82-5.46 6.67-12.23 10.63-20.31 11.88-.12-1.04-.18-2.01-.18-2.91z" />
                    </svg>
                </button>
                <button className="font-bold hover:opacity-80">Finder</button>
                <button className="hidden sm:inline-block hover:opacity-80">File</button>
                <button className="hidden sm:inline-block hover:opacity-80">Edit</button>
                <button className="hidden sm:inline-block hover:opacity-80">View</button>
                <button className="hidden sm:inline-block hover:opacity-80">Go</button>
                <button className="hidden sm:inline-block hover:opacity-80">Window</button>
                <button className="hidden sm:inline-block hover:opacity-80">Help</button>
            </div>

             Right Status Bar Icons 
            <div className="flex items-center gap-3.5 font-medium">
                <button className="hover:opacity-80">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M17 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm1 10c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v8zm5-7v6c0 .55-.45 1-1 1s-1-.45-1-1V9c0-.55.45-1 1-1s1 .45 1 1z"/>
                    </svg>
                </button>

                <button className="hover:opacity-80">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 3C7.95 3 4.21 4.34 1.2 6.6L12 21 22.8 6.6C19.79 4.34 16.05 3 12 3z"/>
                    </svg>
                </button>

                <button className="hover:opacity-80">
                    <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>

                <button className="hover:opacity-80">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                    </svg>
                </button>

                <span className="ml-1 text-[11px] font-normal">{dateTime}</span>
            </div>
        </header>
    );
};